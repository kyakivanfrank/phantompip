export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getMt5Credentials } from "@/lib/server/db";
import { Mt5Credentials } from "@/lib/types";
import { handleApiError, successResponse } from "@/lib/server/api-response";

export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuth();
    const credentials = await getMt5Credentials(session.userId);

    if (!credentials || Object.keys(credentials).length === 0) {
      return successResponse(
        {
          connected: false,
          connectionStatus: "Disconnected",
        },
        "No MT5 connection found",
        200
      );
    }

    return successResponse(
      {
        connected: (credentials as Partial<Mt5Credentials>).connectionStatus === "Connected",
        connectionStatus: (credentials as Partial<Mt5Credentials>).connectionStatus,
        tradingStyle: (credentials as Partial<Mt5Credentials>).tradingStyle,
        mt5LoginId: (credentials as Partial<Mt5Credentials>).mt5LoginId,
        brokerServer: (credentials as Partial<Mt5Credentials>).brokerServer,
        connectedAt: (credentials as Partial<Mt5Credentials>).connectedAt,
      },
      "MT5 status retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
