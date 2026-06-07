import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { setMt5Credentials, updateUser } from "@/lib/server/db";
import {
  isValidMt5LoginId,
  isValidBrokerServer,
  sanitizeInput,
} from "@/lib/server/validation";
import { encryptMt5Password } from "@/lib/server/crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { mt5LoginId, mt5Password, brokerServer, tradingStyle } = body;

    // Validate inputs
    if (!mt5LoginId || !mt5Password || !brokerServer || !tradingStyle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidMt5LoginId(mt5LoginId)) {
      return NextResponse.json(
        { error: "Invalid MT5 Login ID format" },
        { status: 400 }
      );
    }

    if (!isValidBrokerServer(brokerServer)) {
      return NextResponse.json(
        { error: "Invalid broker server format" },
        { status: 400 }
      );
    }

    if (!["Scalping", "Conservative", "Aggressive"].includes(tradingStyle)) {
      return NextResponse.json(
        { error: "Invalid trading style" },
        { status: 400 }
      );
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

    return NextResponse.json(
      {
        message: "MT5 account connected successfully",
        connectionStatus: "Connected",
        tradingStyle,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("MT5 connect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
