import { NextResponse, NextRequest } from 'next/server';
import { getSessionCookie } from '@/lib/server/auth';
import { getBotSettings, updateBotSettings, toggleBotActive } from '@/lib/server/db';
import { Bots } from '@/lib/types';

import { DEFAULT_BOTS } from '@/lib/server/bot-defaults';

function mapBotIdToKey(botId: string): keyof Bots | null {
  if (botId === '1' || botId === 'neuralXTrend') return 'neuralXTrend';
  if (botId === '2' || botId === 'scalpAlpha') return 'scalpAlpha';
  if (botId === '3' || botId === 'gridSentinel') return 'gridSentinel';
  return null;
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

    const settings = await getBotSettings(session.userId, botKey);
    
    return NextResponse.json({
      success: true,
      data: settings || DEFAULT_BOTS[botKey].settings,
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

    // Map old frontend keys to new backend schema if old keys are sent
    const stopLossPercent = body.stopLoss !== undefined ? parseFloat(body.stopLoss) : parseFloat(body.stopLossPercent);
    const takeProfitPercent = body.takeProfit !== undefined ? parseFloat(body.takeProfit) : parseFloat(body.takeProfitPercent);
    const maxDrawdownPercent = body.maxDrawdown !== undefined ? parseFloat(body.maxDrawdown) : parseFloat(body.maxDrawdownPercent);
    const dailyLossLimitPercent = body.dailyLossLimit !== undefined ? parseFloat(body.dailyLossLimit) : parseFloat(body.dailyLossLimitPercent);
    const lotSize = parseFloat(body.lotSize);
    
    // Validate value ranges (1-100% for all percentages)
    if (stopLossPercent < 0.1 || stopLossPercent > 100) {
      return NextResponse.json({ success: false, error: 'Stop Loss must be between 0.1% and 100%' }, { status: 400 });
    }
    if (takeProfitPercent < 0.1 || takeProfitPercent > 100) {
      return NextResponse.json({ success: false, error: 'Take Profit must be between 0.1% and 100%' }, { status: 400 });
    }
    if (maxDrawdownPercent < 0.1 || maxDrawdownPercent > 100) {
      return NextResponse.json({ success: false, error: 'Max Drawdown must be between 0.1% and 100%' }, { status: 400 });
    }
    if (dailyLossLimitPercent < 0.1 || dailyLossLimitPercent > 100) {
      return NextResponse.json({ success: false, error: 'Daily Loss Limit must be between 0.1% and 100%' }, { status: 400 });
    }
    if (lotSize < 0.01 || lotSize > 100) {
      return NextResponse.json({ success: false, error: 'Lot Size must be between 0.01 and 100' }, { status: 400 });
    }

    const settings = {
      stopLossPercent,
      takeProfitPercent,
      maxDrawdownPercent,
      dailyLossLimitPercent,
      lotSize,
    };

    await updateBotSettings(session.userId, botKey, settings);

    if (body.enabled !== undefined || body.isActive !== undefined) {
      const isActive = body.enabled !== undefined ? Boolean(body.enabled) : Boolean(body.isActive);
      await toggleBotActive(session.userId, botKey, isActive);
    }

    return NextResponse.json({
      success: true,
      data: settings,
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
