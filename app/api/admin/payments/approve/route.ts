export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getPayment, getUser, updatePaymentStatus, updateSubscription } from "@/lib/server/db";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";
import { ACTIVATION_FEE } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return errorResponse("Payment ID is required", 400);
    }

    // Get payment (searches across all users)
    const payment = await getPayment(paymentId);

    if (!payment) {
      return errorResponse("Payment not found", 404);
    }

    if (payment.status !== "pending") {
      return errorResponse("Payment is not pending", 400);
    }

    const userId = payment.userId;
    const now = new Date();

    const user = await getUser(userId);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Determine new expiry date (stack if already active)
    let baseDate = now;
    if (user.subscription?.expiryDate) {
      const currentExpiry = new Date(user.subscription.expiryDate);
      if (currentExpiry > now) {
        baseDate = currentExpiry;
      }
    }

    // Add 1 month
    const expiryDate = new Date(baseDate);
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    const expiryIso = expiryDate.toISOString().split('T')[0];

    // Approve payment inside the user's document
    await updatePaymentStatus(userId, paymentId, "confirmed");

    await updateSubscription(userId, {
      status: "active",
      approvalStatus: "approved",
      approvedAt: now.toISOString(),
      startDate: now.toISOString().split('T')[0],
      billingCycle: "monthly",
      expiryDate: expiryIso,
      planName: "PhantomPip Bot",
      priceUSD: ACTIVATION_FEE,
    });

    return successResponse(
      {
        paymentId,
        newExpiryDate: expiryIso,
        status: "confirmed",
      },
      "Payment approved — user activated successfully",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}