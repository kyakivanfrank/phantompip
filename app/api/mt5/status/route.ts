export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getMt5Credentials } from "@/lib/server/db";
import { handleApiError, successResponse } from "@/lib/server/api-response";

export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuth();
    const credentials = await getMt5Credentials(session.userId);

    // Determine if has credentials by checking required fields
    const hasCredentials = !!(credentials?.loginId?.trim() && credentials?.password?.trim() && credentials?.brokerServer?.trim());

    if (!hasCredentials) {
      return successResponse(
        {
          connected: false,
        },
        "No MT5 credentials found",
        200
      );
    }

    return successResponse(
      {
        connected: credentials.isConnected,
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
