export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getPayment, updatePaymentStatus, updateSubscription, getUser } from "@/lib/server/db";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";
import { isValidPlanId, getPlan, PLANS } from "@/lib/plans";

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

    const userPlan = userData?.subscription?.planName
      ? Object.values(PLANS).find((plan) => plan.name === userData.subscription.planName)
      : undefined;

    let resolvedPlanName: string | null = null;
    if (payment.planId && isValidPlanId(payment.planId)) {
      resolvedPlanName = getPlan(payment.planId).name;
    } else if (payment.planName && Object.values(PLANS).some((plan) => plan.name === payment.planName)) {
      resolvedPlanName = payment.planName;
    } else if (userPlan) {
      resolvedPlanName = userPlan.name;
    }

    if (!resolvedPlanName) {
      return errorResponse("Cannot approve payment: valid plan information is missing.", 400);
    }

    const planPrice = payment.planId && isValidPlanId(payment.planId)
      ? getPlan(payment.planId).price
      : payment.amount || userData?.subscription?.priceUSD || 0;
    const newPriceUSD = planPrice;
    const startDateIso = userData?.subscription?.startDate && userData.subscription.startDate !== ""
      ? userData.subscription.startDate
      : now.toISOString().split('T')[0];
    const billingCycle = userData?.subscription?.billingCycle || "monthly";

    await updateSubscription(userId, {
      status: "active",
      approvalStatus: "approved",
      approvedAt: now.toISOString(),
      startDate: startDateIso,
      billingCycle,
      expiryDate: newExpiryIso,
      planName: resolvedPlanName,
      priceUSD: newPriceUSD,
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