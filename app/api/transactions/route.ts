import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUserTransactions } from '@/lib/database';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await getUserTransactions(session.userId);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('[app] Transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
