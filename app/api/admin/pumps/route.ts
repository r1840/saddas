import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getAllActivePumps } from '@/lib/database';

export async function GET() {
  const session = await getSession();

  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pumps = await getAllActivePumps();
  return NextResponse.json({ pumps });
}
