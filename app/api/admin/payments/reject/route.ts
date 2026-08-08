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

    // Get payment
    const payment = await getPayment(paymentId);
    if (!payment) {
      return errorResponse("Payment not found", 404);
    }

    if (payment.status !== "pending") {
      return errorResponse("Payment is not pending", 400);
    }

    // Reject payment
    await updatePaymentStatus(payment.userId, paymentId, "rejected");
    
    // Get user to see if they are active
    const user = await getUser(payment.userId);
    const now = Date.now();
    const expiryTimestamp = user?.subscription?.expiryDate ? new Date(user.subscription.expiryDate).getTime() : 0;
    
    const isCurrentlyActive = 
      user?.subscription?.status === "active" && 
      user?.subscription?.approvalStatus === "approved" &&
      expiryTimestamp > now;

    if (!isCurrentlyActive) {
      // Set subscription to inactive/rejected and clear any temporary plan assignment
      await updateSubscription(payment.userId, {
        status: "inactive",
        approvalStatus: "rejected",
        planName: "No Plan",
        priceUSD: 0,
        expiryDate: "",
      });
    }

    return successResponse(
      {
        paymentId,
        status: "rejected",
      },
      "Payment rejected successfully",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}