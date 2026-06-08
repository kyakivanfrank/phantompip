import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getPayment, updatePayment, updateUser, getUser } from "@/lib/server/db";
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

    if (!payment || Object.keys(payment).length === 0) {
      return errorResponse("Payment not found", 404);
    }

    // Safely cast to Record to avoid TypeScript inference errors
    const p = payment as Record<string, any>;

    if (p.status !== "Pending") {
      return errorResponse("Payment is not pending", 400);
    }

    // Approve payment
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    await updatePayment(paymentId, {
      status: "Approved",
      approvedAt: now,
    });

    // Update user subscription
    const userId = p.userId as string;
    const userData = await getUser(userId);

    // Safely cast userData to access dynamic properties without TS errors
    const ud = userData as Record<string, any> | null;

    // Safely parse the current expiry, falling back to 'now' if invalid or missing
    let currentExpiry = now;
    if (ud && ud.subscriptionExpiresAt) {
      const parsed = parseInt(ud.subscriptionExpiresAt.toString(), 10);
      if (!isNaN(parsed)) {
        currentExpiry = parsed;
      }
    }

    const newExpiry = Math.max(currentExpiry, now) + thirtyDaysMs;

    await updateUser(userId, {
      accountStatus: "Active",
      subscriptionExpiresAt: newExpiry,
    });

    return successResponse(
      {
        paymentId,
        newExpiryDate: newExpiry,
        status: "Approved",
      },
      "Payment approved successfully",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}