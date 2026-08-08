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
import { isValidPlanId, getPlanPrice, getPlan } from "@/lib/plans";

const FALLBACK_AMOUNT = 50; // $50 default

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
    const { transactionId, method, planId } = body;

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

    // Determine payment amount from plan
    let paymentAmount = FALLBACK_AMOUNT;
    let resolvedPlanName = "Starter Scalper";

    if (planId && isValidPlanId(planId)) {
      paymentAmount = getPlanPrice(planId);
      resolvedPlanName = getPlan(planId).name;
    } else {
      // Try to derive from user's existing subscription
      const user = await getUser(session.userId);
      if (user?.subscription?.priceUSD && user.subscription.priceUSD > 0) {
        paymentAmount = user.subscription.priceUSD;
      }
    }

    const { paymentMethod, paymentNetwork } = mapMethod(method as FrontendMethod);

    // Create payment record
    const paymentId = "pay_" + randomUUID().substring(0, 8);
    const now = new Date().toISOString();

    const newPayment: Payment = {
      paymentId,
      amount: paymentAmount,
      method: paymentMethod,
      network: paymentNetwork,
      transactionRef: sanitizeInput(transactionId),
      status: "pending",
      submittedAt: now,
    };

    await createPayment(session.userId, newPayment);

    // Update subscription plan details if a valid planId was provided
    if (planId && isValidPlanId(planId)) {
      await updateSubscription(session.userId, {
        planName: resolvedPlanName,
        priceUSD: paymentAmount,
      });
    }

    return successResponse(
      {
        paymentId,
        amount: paymentAmount,
        planName: resolvedPlanName,
        status: "pending",
      },
      "Payment submitted successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
