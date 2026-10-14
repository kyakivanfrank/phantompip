export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { getSessionCookie, clearSessionCookie } from "@/lib/server/auth";
import { executeRead } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

export async function GET(_req: NextRequest) {
  try {
    const session = await getSessionCookie();
    if (!session || !session.userId) {
      await clearSessionCookie();
      return errorResponse("No active session", 401);
    }

    // Direct indexed point query on PK - sub-millisecond execution
    const userRow = await executeRead("sessionCheck", async (supabase) => {
      const { data, error } = await supabase
        .from("users")
        .select("id, is_admin")
        .eq("id", session.userId)
        .maybeSingle();

      if (error) {
        throw new Error(`Session check DB error: ${error.message}`);
      }

      return data;
    });

    if (!userRow) {
      // User has been deleted from database!
      await clearSessionCookie();
      return errorResponse("Account has been deleted", 401);
    }

    // If session claims admin but database says not admin
    if (session.isAdmin && !userRow.is_admin) {
      await clearSessionCookie();
      return errorResponse("Admin privileges revoked", 401);
    }

    return successResponse(
      {
        valid: true,
        userId: userRow.id,
        isAdmin: Boolean(userRow.is_admin),
      },
      "Session active",
      200
    );
  } catch (error) {
    return errorResponse("Session check failed", 401);
  }
}
