export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuth, clearSessionCookie } from "@/lib/server/auth";
import { getUser, getUserPayments } from "@/lib/server/db";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";

export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuth();
    const user = await getUser(session.userId);
    if (!user) {
      await clearSessionCookie();
      return errorResponse("User account not found or deleted", 401);
    }
    const payments = await getUserPayments(session.userId);

    return successResponse(
      {
        payments: (payments as any[]).map((p) => ({
          id: p.id,
          method: p.method,
          transactionId: p.transactionId,
          amount: p.amount,
          status: p.status,
          createdAt: p.createdAt,
          approvedAt: p.approvedAt,
        })),
      },
      "Payments retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
