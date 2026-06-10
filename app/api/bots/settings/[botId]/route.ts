import { NextResponse } from 'next/server';
import { getSessionCookie } from '@/lib/server/auth';
import { getBotSettings, setBotSettings } from '@/lib/server/db';

export async function GET(
  _request: Request,
  { params }: { params: { botId: string } }
) {
  try {
    const session = await getSessionCookie();
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const botId = parseInt(params.botId);
    if (isNaN(botId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid bot ID' },
        { status: 400 }
      );
    }

    const settings = await getBotSettings(session.userId, botId);
    
    return NextResponse.json({
      success: true,
      data: settings,
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
  request: Request,
  { params }: { params: { botId: string } }
) {
  try {
    const session = await getSessionCookie();
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const botId = parseInt(params.botId);
    if (isNaN(botId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid bot ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const { enabled, stopLoss, takeProfit, maxDrawdown, dailyLossLimit, lotSize } = body;
    
    if (
      enabled === undefined ||
      stopLoss === undefined ||
      takeProfit === undefined ||
      maxDrawdown === undefined ||
      dailyLossLimit === undefined ||
      lotSize === undefined
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate value ranges (1-100% for all percentages)
    if (stopLoss < 1 || stopLoss > 100) {
      return NextResponse.json(
        { success: false, error: 'Stop Loss must be between 1% and 100%' },
        { status: 400 }
      );
    }

    if (takeProfit < 1 || takeProfit > 100) {
      return NextResponse.json(
        { success: false, error: 'Take Profit must be between 1% and 100%' },
        { status: 400 }
      );
    }

    if (maxDrawdown < 1 || maxDrawdown > 100) {
      return NextResponse.json(
        { success: false, error: 'Max Drawdown must be between 1% and 100%' },
        { status: 400 }
      );
    }

    if (dailyLossLimit < 1 || dailyLossLimit > 100) {
      return NextResponse.json(
        { success: false, error: 'Daily Loss Limit must be between 1% and 100%' },
        { status: 400 }
      );
    }

    if (lotSize < 0.01 || lotSize > 100) {
      return NextResponse.json(
        { success: false, error: 'Lot Size must be between 0.01 and 100' },
        { status: 400 }
      );
    }

    const settings = {
      botId,
      userId: session.userId,
      enabled: Boolean(enabled),
      stopLoss: parseFloat(stopLoss),
      takeProfit: parseFloat(takeProfit),
      maxDrawdown: parseFloat(maxDrawdown),
      dailyLossLimit: parseFloat(dailyLossLimit),
      lotSize: parseFloat(lotSize),
      updatedAt: new Date().toISOString(),
    };

    await setBotSettings(session.userId, botId, settings);

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
