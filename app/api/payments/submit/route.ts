export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { requireAuth } from "@/lib/server/auth";
import { createPayment, getCoupon, updateCoupon } from "@/lib/server/db";
import {
  isValidTransactionId,
  sanitizeInput,
} from "@/lib/server/validation";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";
import { Payment } from "@/lib/types";

const BASE_AMOUNT = 50; // $50

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { transactionId, method, couponCode } = body;

    // Validate inputs
    if (!transactionId || !method) {
      return errorResponse("Transaction ID and method are required", 400);
    }

    if (!isValidTransactionId(transactionId)) {
      return errorResponse("Invalid transaction ID format", 400);
    }

    if (!["USDT-TRC20", "MTN-MoMo", "Airtel"].includes(method)) {
      return errorResponse("Invalid payment method", 400);
    }

    // Check coupon if provided
    let finalAmount = BASE_AMOUNT;
    let discountPercent = 0;

    if (couponCode) {
      const coupon = await getCoupon(couponCode);
      if (!coupon || Object.keys(coupon).length === 0) {
        return errorResponse("Invalid coupon code", 400);
      }

      // Check coupon validity
      if (
        (coupon as any).isActive !== true &&
        (coupon as any).isActive !== "true" &&
        parseInt((coupon as any).currentUses as any, 10) >= parseInt((coupon as any).maxUses as any, 10)
      ) {
        return errorResponse("Coupon expired or limit reached", 400);
      }

      if ((coupon as any).expiresAt < Date.now()) {
        return errorResponse("Coupon expired", 400);
      }

      discountPercent = parseInt((coupon as any).discountPercent as any, 10);
      finalAmount = BASE_AMOUNT - (BASE_AMOUNT * discountPercent) / 100;

      // Update coupon usage
      await updateCoupon(couponCode, {
        currentUses: (parseInt((coupon as any).currentUses as any, 10) || 0) + 1,
      });
    }

    // Create payment record
    const paymentId = "pay_" + randomUUID().substring(0, 8);
    const now = new Date().toISOString();

    let paymentMethod: Payment["method"] = "USDT";
    let paymentNetwork: Payment["network"] = "TRON (TRC20)";

    if (method === "MTN-MoMo") {
      paymentMethod = "MTNMobileMoney";
      paymentNetwork = "MTN";
    } else if (method === "Airtel") {
      paymentMethod = "AirtelMoney";
      paymentNetwork = "Airtel";
    }

    const newPayment: Payment & { originalAmount?: number; couponCode?: string } = {
      paymentId,
      amount: finalAmount,
      method: paymentMethod,
      network: paymentNetwork,
      transactionRef: sanitizeInput(transactionId),
      status: "pending",
      submittedAt: now,
    };
    
    // Attach legacy coupon fields just in case they are still needed by other routes
    if (couponCode) {
      newPayment.couponCode = couponCode;
      newPayment.originalAmount = BASE_AMOUNT;
    }

    await createPayment(session.userId, newPayment as Payment);

    return successResponse(
      {
        paymentId,
        amount: finalAmount,
        originalAmount: couponCode ? BASE_AMOUNT : undefined,
        discountPercent,
        status: "pending",
      },
      "Payment submitted successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
