import { NextRequest, NextResponse } from 'next/server';
import Decimal from 'decimal.js';
import { getSession } from '@/lib/session';
import { getPortfolio, updatePortfolio, createTransaction } from '@/lib/database';
import { getCoinById } from '@/lib/crypto-service';

function d(value: string | number): Decimal {
  return new Decimal(value);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { coinId, amount, type } = await request.json();

    if (!coinId || !amount || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type !== 'buy' && type !== 'sell') {
      return NextResponse.json({ error: 'Invalid trade type' }, { status: 400 });
    }

    const coin = await getCoinById(coinId);
    if (!coin) {
      return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
    }

    const portfolio = await getPortfolio(session.userId);
    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const amountDec = d(amount);
    if (!amountDec.isFinite() || amountDec.lte(0)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const amountStr = amountDec.toFixed(8);
    const priceDec = d(coin.current_price);
    const priceStr = priceDec.toFixed(8);
    const totalDec = amountDec.mul(priceDec);
    const totalStr = totalDec.toFixed(8);

    if (type === 'buy') {
      const availableCash = d(portfolio.cash);

      if (totalDec.gt(availableCash)) {
        return NextResponse.json(
          { error: 'Insufficient funds' },
          { status: 400 }
        );
      }

      portfolio.cash = availableCash.minus(totalDec).toFixed(8);

      if (!portfolio.holdings[coinId]) {
        portfolio.holdings[coinId] = {
          amount: amountStr,
          averagePrice: priceStr,
        };
      } else {
        const currentAmount = d(portfolio.holdings[coinId].amount);
        const currentAvgPrice = d(portfolio.holdings[coinId].averagePrice);
        const newAmount = currentAmount.plus(amountDec);

        const totalCost = currentAmount.mul(currentAvgPrice).plus(totalDec);
        const newAvgPrice = totalCost.div(newAmount);

        portfolio.holdings[coinId] = {
          amount: newAmount.toFixed(8),
          averagePrice: newAvgPrice.toFixed(8),
        };
      }
    } else {
      if (!portfolio.holdings[coinId]) {
        return NextResponse.json(
          { error: 'You do not own this coin' },
          { status: 400 }
        );
      }

      const availableAmount = d(portfolio.holdings[coinId].amount);
      if (amountDec.gt(availableAmount)) {
        return NextResponse.json(
          { error: 'Insufficient coins' },
          { status: 400 }
        );
      }

      portfolio.cash = d(portfolio.cash).plus(totalDec).toFixed(8);

      if (amountDec.eq(availableAmount)) {
        delete portfolio.holdings[coinId];
      } else {
        portfolio.holdings[coinId].amount = availableAmount.minus(amountDec).toFixed(8);
      }
    }

    await updatePortfolio(portfolio);

    await createTransaction({
      userId: session.userId,
      coinId,
      coinName: coin.name,
      type,
      amount: amountStr,
      price: priceStr,
      total: totalStr,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, portfolio });
  } catch (error) {
    console.error('[app] Trade error:', error);
    return NextResponse.json({ error: 'Trade failed' }, { status: 500 });
  }
}
