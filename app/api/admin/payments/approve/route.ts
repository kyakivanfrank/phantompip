export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getPayment, updatePaymentStatus, updateSubscription, getUser } from "@/lib/server/db";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return errorResponse("Payment ID is required", 400);
    }

    // Get payment (now nested in user, so getPayment searches across users or needs userId)
    const payment = await getPayment(paymentId);

    if (!payment) {
      return errorResponse("Payment not found", 404);
    }

    if (payment.status !== "pending") {
      return errorResponse("Payment is not pending", 400);
    }

    const userId = payment.userId;
    const now = new Date();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    // Approve payment inside the user's document
    await updatePaymentStatus(userId, paymentId, "confirmed");

    // Update user subscription
    const userData = await getUser(userId);
    let currentExpiry = now;
    if (userData && userData.subscription.expiryDate) {
      const parsed = new Date(userData.subscription.expiryDate);
      if (!isNaN(parsed.getTime())) {
         currentExpiry = parsed;
      }
    }

    const newExpiry = new Date(Math.max(currentExpiry.getTime(), now.getTime()) + thirtyDaysMs);
    const newExpiryIso = newExpiry.toISOString().split('T')[0];

    await updateSubscription(userId, {
      status: "active",
      approvalStatus: "approved",
      approvedAt: now.toISOString(),
      expiryDate: newExpiryIso,
    });

    return successResponse(
      {
        paymentId,
        newExpiryDate: newExpiryIso,
        status: "confirmed",
      },
      "Payment approved successfully",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}