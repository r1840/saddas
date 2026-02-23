import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { addUserAsset, getPortfolio } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, amount, assetType = 'cash' } = await request.json();

    if (!userId || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing userId or amount' },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    await addUserAsset(userId, assetType, numAmount);
    const portfolio = await getPortfolio(userId);

    return NextResponse.json({ success: true, portfolio });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update balance' },
      { status: 500 }
    );
  }
}
