export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getUser, setMt5Credentials } from "@/lib/server/db";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const user = await getUser(session.userId);

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (!user.mt5 || !user.mt5.isConnected) {
      return errorResponse("MT5 is not connected", 400);
    }

    const body = await req.json();
    const isBotRunning = Boolean(body.isBotRunning);

    await setMt5Credentials(session.userId, {
      ...user.mt5,
      isBotRunning
    });

    return successResponse(
      { isBotRunning },
      isBotRunning ? "Bot started" : "Bot stopped",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
