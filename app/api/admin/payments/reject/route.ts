export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getPayment, updatePayment } from "@/lib/server/db";
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

    if ((payment as any).status !== "Pending") {
      return errorResponse("Payment is not pending", 400);
    }

    // Reject payment
    await updatePayment(paymentId, {
      status: "Rejected",
    });

    return successResponse(
      {
        paymentId,
        status: "Rejected",
      },
      "Payment rejected successfully",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}