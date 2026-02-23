import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getAiTradingEnabled, setAiTradingEnabled } from '@/lib/database';

export async function POST() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await setAiTradingEnabled(session.userId, true);
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const enabled = await getAiTradingEnabled(session.userId);
  return NextResponse.json({ enabled });
}

export async function DELETE() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await setAiTradingEnabled(session.userId, false);
  return NextResponse.json({ success: true });
}
