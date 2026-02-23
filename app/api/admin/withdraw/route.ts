import { NextRequest, NextResponse } from 'next/server';
import Decimal from 'decimal.js';
import { getSession } from '@/lib/session';
import { createTransaction, getPortfolio, updatePortfolio } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, coinId, amount, address } = await request.json();

    if (!userId || !coinId || !amount || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const withdrawAmount = new Decimal(amount);
    if (!withdrawAmount.isFinite() || withdrawAmount.lte(0)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const portfolio = await getPortfolio(userId);
    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const holding = portfolio.holdings[coinId];
    if (!holding) {
      return NextResponse.json({ error: 'User does not own this asset' }, { status: 400 });
    }

    const available = new Decimal(holding.amount);
    if (withdrawAmount.gt(available)) {
      return NextResponse.json({ error: 'Insufficient asset balance' }, { status: 400 });
    }

    const remaining = available.minus(withdrawAmount);
    if (remaining.eq(0)) {
      delete portfolio.holdings[coinId];
    } else {
      portfolio.holdings[coinId].amount = remaining.toFixed(8);
    }

    portfolio.pumpGainPercent = 0;
    await updatePortfolio(portfolio);

    await createTransaction({
      userId,
      coinId,
      coinName: coinId,
      type: 'withdraw',
      amount: withdrawAmount.toFixed(8),
      price: '0',
      total: '0',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, portfolio, address });
  } catch (error) {
    console.error('[app] Admin withdraw error:', error);
    return NextResponse.json({ error: 'Failed to process withdraw' }, { status: 500 });
  }
}
