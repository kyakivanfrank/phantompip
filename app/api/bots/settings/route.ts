import { NextResponse } from 'next/server';
import { getSessionCookie } from '@/lib/server/auth';
import { getAllUserBotSettings } from '@/lib/server/db';
import { Bot, Bots } from '@/lib/types';

export const dynamic = 'force-dynamic';

function serializeBot(botKey: keyof Bots, bot: Bot) {
  return {
    botKey,
    ...bot,
    isEnabled: bot.isEnabled ?? false,
  };
}

export async function GET() {
  try {
    const session = await getSessionCookie();
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const allBots = await getAllUserBotSettings(session.userId);

    return NextResponse.json({
      success: true,
      data: {
        neuralXTrend: serializeBot('neuralXTrend', allBots.neuralXTrend),
        scalpAlpha: serializeBot('scalpAlpha', allBots.scalpAlpha),
        gridSentinel: serializeBot('gridSentinel', allBots.gridSentinel),
      }
    });
  } catch (error) {
    console.error('Error fetching all bots settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bots settings' },
      { status: 500 }
    );
  }
}
