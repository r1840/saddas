import { NextResponse } from 'next/server';
import Decimal from 'decimal.js';
import { addPumpGainPercent, getAllActivePumps, getPortfolio, updatePortfolio, updatePump } from '@/lib/database';

export async function POST() {
  try {
    const activePumps = await getAllActivePumps();
    const now = new Date();

    for (const pump of activePumps) {
      const endTime = new Date(pump.endTime);

      if (now >= endTime) {
        pump.completedPercentage = pump.percentage;
        pump.isActive = false;
        await updatePump(pump);
        await addPumpGainPercent(pump.userId, pump.percentage);
        continue;
      }

      const startTime = new Date(pump.startTime);
      const totalDurationMs = endTime.getTime() - startTime.getTime();
      const elapsedMs = now.getTime() - startTime.getTime();

      const progressPercentage = new Decimal(elapsedMs)
        .div(new Decimal(totalDurationMs))
        .mul(100);

      const targetCompletedPercentage = progressPercentage
        .div(100)
        .mul(new Decimal(pump.percentage));

      if (targetCompletedPercentage.gt(new Decimal(pump.completedPercentage))) {
        const incrementPercentage = targetCompletedPercentage.minus(new Decimal(pump.completedPercentage));

        const portfolio = await getPortfolio(pump.userId);
        if (portfolio && portfolio.holdings[pump.coinId]) {
          const holding = portfolio.holdings[pump.coinId];
          const currentAmount = new Decimal(holding.amount);
          const incrementAmount = currentAmount.mul(incrementPercentage.div(100));

          const newAmount = currentAmount.plus(incrementAmount).toFixed(8);

          const initialAmount = new Decimal(pump.initialAmount || '0');
          const totalGain = new Decimal(newAmount).minus(initialAmount).toFixed(8);

          holding.amount = newAmount;
          await updatePortfolio(portfolio);

          pump.completedPercentage = Number(targetCompletedPercentage.toFixed(8));
          pump.currentGainAmount = totalGain;
          await updatePump(pump);
        }
      }
    }

    return NextResponse.json({ success: true, processed: activePumps.length });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
