export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { requireAuth } from "@/lib/server/auth";
import { createPayment, getUser, updateSubscription } from "@/lib/server/db";
import {
  isValidTransactionId,
  sanitizeInput,
} from "@/lib/server/validation";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";
import { Payment } from "@/lib/types";
import { ACTIVATION_FEE } from "@/lib/constants";

const VALID_METHODS = ["BTC", "BEP20", "ERC20"] as const;
type PaymentMethod = typeof VALID_METHODS[number];

function mapNetwork(method: PaymentMethod): Payment["network"] {
  switch (method) {
    case "BTC":
      return "Bitcoin";
    case "BEP20":
      return "BNB Smart Chain (BEP20)";
    case "ERC20":
      return "Ethereum (ERC20)";
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const transactionId = typeof body.transactionId === 'string' ? body.transactionId : undefined;
    const method = typeof body.method === 'string' ? body.method : undefined;

    // Validate inputs
    if (!transactionId || !method) {
      return errorResponse("Transaction ID and payment method are required", 400);
    }

    if (!VALID_METHODS.includes(method as PaymentMethod)) {
      return errorResponse("Invalid payment method. Use BTC, BEP20, or ERC20.", 400);
    }

    if (!isValidTransactionId(transactionId)) {
      return errorResponse(
        "Invalid transaction ID format. Please paste the exact reference or hash from your payment confirmation.",
        400
      );
    }

    // Check if user already has an active subscription (already activated)
    const existingUser = await getUser(session.userId);
    if (
      existingUser?.subscription?.status === "active" &&
      existingUser?.subscription?.approvalStatus === "approved"
    ) {
      return errorResponse("Your bot is already activated.", 400);
    }

    const paymentMethod = method as PaymentMethod;
    const paymentNetwork = mapNetwork(paymentMethod);

    // Create payment record
    const paymentId = "pay_" + randomUUID().substring(0, 8);
    const now = new Date().toISOString();

    const newPayment: Payment = {
      paymentId,
      amount: ACTIVATION_FEE,
      method: paymentMethod,
      network: paymentNetwork,
      transactionRef: sanitizeInput(transactionId),
      status: "pending",
      submittedAt: now,
    };

    await createPayment(session.userId, newPayment);

    // Set subscription approval to pending
    await updateSubscription(session.userId, {
      approvalStatus: "pending",
      status: "inactive",
    });

    return successResponse(
      {
        paymentId,
        amount: ACTIVATION_FEE,
        status: "pending",
      },
      "Payment submitted successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
