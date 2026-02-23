import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getPortfolio, createPump } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const adminUser = await getSessionUser();

    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, coinId, percentage, durationMinutes } = await request.json();

    if (!userId || !coinId || !percentage || !durationMinutes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const portfolio = await getPortfolio(userId);

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const holding = portfolio.holdings?.[coinId];
    if (!holding || Number(holding.amount) === 0) {
      return NextResponse.json(
        { error: `User does not own ${coinId}. Add crypto to their balance first.` },
        { status: 400 }
      );
    }

    const pump = await createPump(userId, coinId, Number(percentage), Number(durationMinutes));
    return NextResponse.json({ pump });
  } catch (error) {
    console.error('[app] Pump creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
