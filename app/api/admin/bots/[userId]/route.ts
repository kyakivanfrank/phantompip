import { NextResponse } from 'next/server';
import { getSessionCookie } from '@/lib/server/auth';
import { getAllUserBotSettings } from '@/lib/server/db';

export async function GET(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getSessionCookie();
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (you might want to add this check)
    // For now, we'll allow users to only view their own bot settings
    if (session.userId !== params.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const botSettings = await getAllUserBotSettings(params.userId);
    
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
