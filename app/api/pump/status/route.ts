import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getActivePumps } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pumps = await getActivePumps(session.userId);

    return NextResponse.json({ pumps });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
