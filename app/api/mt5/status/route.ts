import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getMt5Credentials } from "@/lib/server/db";
import { Mt5Credentials } from "@/lib/types";

export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuth();
    let credentials: Partial<Mt5Credentials> | Record<string, never>;
    try {
      credentials = await getMt5Credentials(session.userId);
    } catch (error) {
      console.error("MT5 status DB error:", error);
      return NextResponse.json(
        { error: "MT5 service unavailable" },
        { status: 503 }
      );
    }

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
        connected: (credentials as Partial<Mt5Credentials>).connectionStatus === "Connected",
        connectionStatus: (credentials as Partial<Mt5Credentials>).connectionStatus,
        tradingStyle: (credentials as Partial<Mt5Credentials>).tradingStyle,
        mt5LoginId: (credentials as Partial<Mt5Credentials>).mt5LoginId,
        brokerServer: (credentials as Partial<Mt5Credentials>).brokerServer,
        connectedAt: (credentials as Partial<Mt5Credentials>).connectedAt,
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
