import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getAllActivePumps, updatePump } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const activePumps = await getAllActivePumps();
    const userPump = activePumps.find((p) => p.userId === userId);

    if (!userPump) {
      return NextResponse.json({ error: 'No active pump found' }, { status: 404 });
    }

    userPump.isActive = false;
    await updatePump(userPump);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[app] Cancel pump error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
