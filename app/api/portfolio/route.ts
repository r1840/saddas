import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getPortfolio } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');

    let targetUserId = session.userId;
    if (requestedUserId && session.isAdmin) {
      targetUserId = requestedUserId;
    }

    const portfolio = await getPortfolio(targetUserId);

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
