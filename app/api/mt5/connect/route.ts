import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { setMt5Credentials, updateUser } from "@/lib/server/db";
import {
  isValidMt5LoginId,
  isValidBrokerServer,
  sanitizeInput,
} from "@/lib/server/validation";
import { encryptMt5Password } from "@/lib/server/crypto";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { mt5LoginId, mt5Password, brokerServer, tradingStyle } = body;

    // Validate inputs
    if (!mt5LoginId || !mt5Password || !brokerServer || !tradingStyle) {
      return errorResponse("Missing required fields", 400);
    }

    if (!isValidMt5LoginId(mt5LoginId)) {
      return errorResponse("Invalid MT5 Login ID format", 400);
    }

    if (!isValidBrokerServer(brokerServer)) {
      return errorResponse("Invalid broker server format", 400);
    }

    if (!["Scalping", "Conservative", "Aggressive"].includes(tradingStyle)) {
      return errorResponse("Invalid trading style", 400);
    }

    // Encrypt MT5 password
    const { encrypted, iv, authTag } = encryptMt5Password(mt5Password);

    // Store encrypted credentials
    const now = Date.now();
    await setMt5Credentials(session.userId, {
      mt5LoginId: sanitizeInput(mt5LoginId),
      mt5PasswordEncrypted: encrypted,
      mt5PasswordIV: iv,
      mt5PasswordAuthTag: authTag,
      brokerServer: sanitizeInput(brokerServer),
      tradingStyle,
      connectionStatus: "Connected",
      connectedAt: now,
    });

    // Update user to mark MT5 as connected
    await updateUser(session.userId, {
      mt5Connected: true,
    });

    return successResponse(
      {
        connectionStatus: "Connected",
        tradingStyle,
        connectedAt: now,
      },
      "MT5 account connected successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
