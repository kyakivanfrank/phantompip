export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAllPayments } from "@/lib/server/db";
import { handleApiError, successResponse } from "@/lib/server/api-response";

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
    const allPayments = await getAllPayments();

    // Filter pending payments
    const pendingPayments = [];

    for (const payment of allPayments) {
      if (payment.status === "pending") {
        pendingPayments.push({
          id: payment.paymentId,
          userId: payment.userId,
          userEmail: payment.userEmail || "Unknown",
          userFullName: payment.username || "Unknown",
          method: payment.method,
          transactionId: payment.transactionRef,
          amount: payment.amount,
          status: payment.status,
          createdAt: new Date(payment.submittedAt).getTime(),
          daysOld: Math.floor((Date.now() - new Date(payment.submittedAt).getTime()) / (24 * 60 * 60 * 1000)),
        });
      }
    }

    return successResponse(
      {
        pendingPayments,
        totalPending: pendingPayments.length,
      },
      "Pending payments retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
