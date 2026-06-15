export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { requireAuth } from "@/lib/server/auth";
import { createPayment } from "@/lib/server/db";
import {
  isValidTransactionId,
  sanitizeInput,
} from "@/lib/server/validation";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";
import { Payment } from "@/lib/types";

const BASE_AMOUNT = 50; // $50

const VALID_METHODS = ["USDT-TRC20", "MTN-MoMo", "Airtel-Merchant", "Airtel-Money"] as const;
type FrontendMethod = typeof VALID_METHODS[number];

function mapMethod(method: FrontendMethod): { paymentMethod: Payment["method"]; paymentNetwork: Payment["network"] } {
  switch (method) {
    case "MTN-MoMo":
      return { paymentMethod: "MTNMobileMoney", paymentNetwork: "MTN" };
    case "Airtel-Merchant":
    case "Airtel-Money":
      return { paymentMethod: "AirtelMoney", paymentNetwork: "Airtel" };
    case "USDT-TRC20":
    default:
      return { paymentMethod: "USDT", paymentNetwork: "TRON (TRC20)" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { transactionId, method } = body;

    // Validate inputs
    if (!transactionId || !method) {
      return errorResponse("Transaction ID and payment method are required", 400);
    }

    if (!VALID_METHODS.includes(method as FrontendMethod)) {
      return errorResponse("Invalid payment method selected", 400);
    }

    if (!isValidTransactionId(transactionId)) {
      return errorResponse(
        "Invalid transaction ID format. Please paste the exact reference or hash from your payment confirmation.",
        400
      );
    }

    const { paymentMethod, paymentNetwork } = mapMethod(method as FrontendMethod);

    // Create payment record
    const paymentId = "pay_" + randomUUID().substring(0, 8);
    const now = new Date().toISOString();

    const newPayment: Payment = {
      paymentId,
      amount: BASE_AMOUNT,
      method: paymentMethod,
      network: paymentNetwork,
      transactionRef: sanitizeInput(transactionId),
      status: "pending",
      submittedAt: now,
    };

    await createPayment(session.userId, newPayment);

    return successResponse(
      {
        paymentId,
        amount: BASE_AMOUNT,
        status: "pending",
      },
      "Payment submitted successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
