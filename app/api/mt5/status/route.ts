export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getMt5Credentials } from "@/lib/server/db";
import { handleApiError, successResponse } from "@/lib/server/api-response";

export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuth();
    const credentials = await getMt5Credentials(session.userId);

    if (!credentials || !credentials.isConnected) {
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
        connected: credentials.isConnected,
        connectionStatus: credentials.isConnected ? "Connected" : "Disconnected",
        mt5LoginId: credentials.loginId,
        brokerServer: credentials.brokerServer,
        connectedAt: credentials.connectedAt,
      },
      "MT5 status retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
