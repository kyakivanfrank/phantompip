import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAllUsers, getMt5Credentials } from "@/lib/server/db";
import { decryptMt5Password } from "@/lib/server/crypto";

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
    let users;
    try {
      users = await getAllUsers();
    } catch (error) {
      console.error("Admin MT5 vault DB error:", error);
      return NextResponse.json(
        { error: "Vault service unavailable" },
        { status: 503 }
      );
    }

    // Get only active users with MT5 connected
    const mt5Vault = [];

    for (const user of users) {
      // Skip admin users
      if ((user as any).isAdmin === true || (user as any).isAdmin === "true") {
        continue;
      }

      // Only show active subscriptions
      if (
        (user as any).accountStatus !== "Active" ||
        ((user as any).mt5Connected !== true && (user as any).mt5Connected !== "true")
      ) {
        continue;
      }

      const credentials = await getMt5Credentials((user as any).id);
      const creds: any = credentials;
      if (!creds || Object.keys(creds).length === 0) {
        continue;
      }

      // Decrypt password only on server-side
      let decryptedPassword = "";
      try {
        decryptedPassword = decryptMt5Password(
          creds.mt5PasswordEncrypted as string,
          creds.mt5PasswordIV as string,
          creds.mt5PasswordAuthTag as string
        );
      } catch (e) {
        console.error(`Failed to decrypt password for user ${user.id}:`, e);
        decryptedPassword = "[DECRYPTION_FAILED]";
      }

      mt5Vault.push({
        userId: (user as any).id,
        userEmail: (user as any).email,
        userFullName: (user as any).fullName,
        subscriptionExpiresAt: (user as any).subscriptionExpiresAt,
        daysRemaining: Math.max(
          0,
          Math.ceil(
            ((user as any).subscriptionExpiresAt - Date.now()) / (24 * 60 * 60 * 1000)
          )
        ),
        mt5LoginId: creds.mt5LoginId,
        mt5Password: decryptedPassword,
        brokerServer: creds.brokerServer,
        tradingStyle: creds.tradingStyle,
        connectionStatus: creds.connectionStatus,
        connectedAt: creds.connectedAt,
      });
    }

    return NextResponse.json(
      {
        mt5Vault,
        totalActive: mt5Vault.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("MT5 vault error:", error);
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
