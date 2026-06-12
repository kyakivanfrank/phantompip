import { NextResponse, NextRequest } from 'next/server';
import { getSessionCookie } from '@/lib/server/auth';
import { getAllUserBotSettings } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSessionCookie();
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await context.params;

    if (session.userId !== userId && !session.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const botSettings = await getAllUserBotSettings(userId);
    
    return NextResponse.json({
      success: true,
      data: botSettings,
    });
  } catch (error) {
    console.error('Error fetching user bot settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user bot settings' },
      { status: 500 }
    );
  }
}
