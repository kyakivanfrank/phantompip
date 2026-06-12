export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getUser, setMt5Credentials } from "@/lib/server/db";
import {
  isValidMt5LoginId,
  isValidBrokerServer,
  sanitizeInput,
} from "@/lib/server/validation";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const user = await getUser(session.userId);

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const expiryTimestamp = new Date(user.subscription.expiryDate).getTime();
    const hasActiveSubscription =
      user.subscription.status === "active" &&
      user.subscription.approvalStatus === "approved" &&
      expiryTimestamp > Date.now();

    if (!hasActiveSubscription) {
      return errorResponse(
        "Active subscription required before connecting MT5",
        403,
        { redirectTo: "/dashboard/subscription" }
      );
    }

    const body = await req.json();
    const { mt5LoginId, mt5Password, brokerServer } = body;

    // Validate inputs
    if (!mt5LoginId || !mt5Password || !brokerServer) {
      return errorResponse("Missing required fields", 400);
    }

    if (!isValidMt5LoginId(mt5LoginId)) {
      return errorResponse("Invalid MT5 Login ID format", 400);
    }

    if (!isValidBrokerServer(brokerServer)) {
      return errorResponse("Invalid broker server format", 400);
    }

    // Store credentials in plain text as requested by prompt
    const now = new Date().toISOString();
    await setMt5Credentials(session.userId, {
      loginId: sanitizeInput(mt5LoginId),
      password: mt5Password, // Plain text intentional per schema
      brokerServer: sanitizeInput(brokerServer),
      connectedAt: now,
      isConnected: true,
    });

    return successResponse(
      {
        connectionStatus: "Connected",
        connectedAt: now,
      },
      "MT5 account connected successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
