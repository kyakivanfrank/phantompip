import { NextResponse, NextRequest } from 'next/server';
import { getSessionCookie } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';
import { getAllUserBotSettings, updateBotSettings } from '@/lib/server/db';
import { Bot, Bots } from '@/lib/types';

function mapBotIdToKey(botId: string): keyof Bots | null {
  if (botId === '1' || botId === 'neuralXTrend') return 'neuralXTrend';
  if (botId === '2' || botId === 'scalpAlpha') return 'scalpAlpha';
  if (botId === '3' || botId === 'gridSentinel') return 'gridSentinel';
  return null;
}

function serializeBot(botKey: keyof Bots, bot: Bot) {
  return {
    botKey,
    ...bot,
    isEnabled: bot.isEnabled ?? false,
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ botId: string }> }
) {
  try {
    const session = await getSessionCookie();
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { botId } = await context.params;
    const botKey = mapBotIdToKey(botId);
    
    if (!botKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid bot ID' },
        { status: 400 }
      );
    }

    const allBots = await getAllUserBotSettings(session.userId);
    const bot = allBots[botKey];
    
    return NextResponse.json({
      success: true,
      data: serializeBot(botKey, bot),
    });
  } catch (error) {
    console.error('Error fetching bot settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bot settings' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ botId: string }> }
) {
  try {
    const session = await getSessionCookie();
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { botId } = await context.params;
    const botKey = mapBotIdToKey(botId);
    if (!botKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid bot ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Map keys to simplified backend schema
    const stopLoss = body.stopLoss !== undefined ? parseFloat(body.stopLoss) : parseFloat(body.stopLossPercent);
    const takeProfit = body.takeProfit !== undefined ? parseFloat(body.takeProfit) : parseFloat(body.takeProfitPercent);
    const maxDrawdown = body.maxDrawdown !== undefined ? parseFloat(body.maxDrawdown) : parseFloat(body.maxDrawdownPercent);
    const dailyLossLimit = body.dailyLossLimit !== undefined ? parseFloat(body.dailyLossLimit) : parseFloat(body.dailyLossLimitPercent);
    const lotSize = parseFloat(body.lotSize);
    
    // Validate value ranges (1-100% for all percentages)
    if (!Number.isFinite(stopLoss) || stopLoss < 0.1 || stopLoss > 100) {
      return NextResponse.json({ success: false, error: 'Stop Loss must be between 0.1% and 100%' }, { status: 400 });
    }
    if (!Number.isFinite(takeProfit) || takeProfit < 0.1 || takeProfit > 100) {
      return NextResponse.json({ success: false, error: 'Take Profit must be between 0.1% and 100%' }, { status: 400 });
    }
    if (!Number.isFinite(maxDrawdown) || maxDrawdown < 0.1 || maxDrawdown > 100) {
      return NextResponse.json({ success: false, error: 'Max Drawdown must be between 0.1% and 100%' }, { status: 400 });
    }
    if (!Number.isFinite(dailyLossLimit) || dailyLossLimit < 0.1 || dailyLossLimit > 100) {
      return NextResponse.json({ success: false, error: 'Daily Loss Limit must be between 0.1% and 100%' }, { status: 400 });
    }
    if (!Number.isFinite(lotSize) || lotSize < 0.01 || lotSize > 100) {
      return NextResponse.json({ success: false, error: 'Lot Size must be between 0.01 and 100' }, { status: 400 });
    }

    const settings = {
      stopLoss,
      takeProfit,
      maxDrawdown,
      dailyLossLimit,
      lotSize,
    };

    const allBots = await getAllUserBotSettings(session.userId);
    const currentBot = allBots[botKey];
    const rawEnabled = body.isEnabled;
    const isEnabled =
      rawEnabled === undefined
        ? currentBot.isEnabled
        : rawEnabled === true || rawEnabled === 'true';

    const savedBot = await updateBotSettings(session.userId, botKey, settings, isEnabled);

    return NextResponse.json({
      success: true,
      data: serializeBot(botKey, savedBot),
      message: 'Bot settings saved successfully',
    });
  } catch (error) {
    console.error('Error saving bot settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save bot settings' },
      { status: 500 }
    );
  }
}
