import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getUserPayments } from "@/lib/server/db";
import { handleApiError, successResponse } from "@/lib/server/api-response";

export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuth();
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
          couponCode: p.couponCode,
          originalAmount: p.originalAmount,
        })),
      },
      "Payments retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
