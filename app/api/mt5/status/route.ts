export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getMt5Credentials } from "@/lib/server/db";
import { handleApiError, successResponse } from "@/lib/server/api-response";

export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuth();
    const credentials = await getMt5Credentials(session.userId);

    // 1. Safe-check with optional chaining to prevent runtime crashes
    const hasCredentials = !!(
      credentials?.loginId?.trim() && 
      credentials?.password?.trim() && 
      credentials?.brokerServer?.trim()
    );

    // 2. CRITICAL: If empty OR explicitly null, return disconnected early
    if (!credentials || !hasCredentials) {
      return successResponse(
        {
          connected: false,
        },
        "No MT5 credentials found",
        200
      );
    }

    // 3. TypeScript is happy now because we proved `credentials` is not null!
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