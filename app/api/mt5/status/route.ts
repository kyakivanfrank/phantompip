import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getMt5Credentials } from "@/lib/server/db";

export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuth();
    const credentials = await getMt5Credentials(session.userId);

    if (!credentials || Object.keys(credentials).length === 0) {
      return NextResponse.json(
        {
          connected: false,
          connectionStatus: "Disconnected",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        connected: credentials.connectionStatus === "Connected",
        connectionStatus: credentials.connectionStatus,
        tradingStyle: credentials.tradingStyle,
        mt5LoginId: credentials.mt5LoginId,
        brokerServer: credentials.brokerServer,
        connectedAt: credentials.connectedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
