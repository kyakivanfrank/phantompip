export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAllPayments, getUser } from "@/lib/server/db";
import { handleApiError, successResponse } from "@/lib/server/api-response";

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
    const allPayments = await getAllPayments();

    // Filter pending payments and enrich with user info
    const pendingPayments = [];

    for (const payment of allPayments) {
      if ((payment as any).status === "Pending") {
        const user = await getUser((payment as any).userId);
        pendingPayments.push({
          id: (payment as any).id,
          userId: (payment as any).userId,
          userEmail: user?.email || "Unknown",
          userFullName: user?.fullName || "Unknown",
          method: (payment as any).method,
          transactionId: (payment as any).transactionId,
          amount: (payment as any).amount,
          originalAmount: (payment as any).originalAmount,
          couponCode: (payment as any).couponCode,
          status: (payment as any).status,
          createdAt: (payment as any).createdAt,
          daysOld: Math.floor((Date.now() - (payment as any).createdAt) / (24 * 60 * 60 * 1000)),
        });
      }
    }

    // Sort by most recent first
    pendingPayments.sort((a, b) => b.createdAt - a.createdAt);

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
