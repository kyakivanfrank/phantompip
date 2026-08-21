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
import { isValidPlanId, type PlanId } from "@/lib/plans";
import { getPlans } from "@/lib/server/settings";

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
    const transactionId = typeof body.transactionId === 'string' ? body.transactionId : undefined;
    const method = typeof body.method === 'string' ? body.method : undefined;
    const planIdRaw = typeof body.planId === 'string' ? body.planId : undefined;
    const planId = isValidPlanId(planIdRaw) ? planIdRaw : undefined;

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

    // Determine payment amount from the selected or current active plan
    let paymentAmount = FALLBACK_AMOUNT;
    let resolvedPlanName = "No Plan";
    let resolvedPlanId: PlanId | undefined = undefined;

    // Prices are admin-managed, so charge from the live catalogue.
    const plans = await getPlans();
    const existingUser = await getUser(session.userId);
    const currentPlan = existingUser?.subscription?.planName
      ? Object.values(plans).find((plan) => plan.name === existingUser.subscription.planName)
      : undefined;
    const hasValidActivePlan = !!(
      currentPlan &&
      existingUser?.subscription?.status === "active" &&
      existingUser?.subscription?.approvalStatus === "approved"
    );

    if (planId) {
      resolvedPlanId = planId;
      paymentAmount = plans[planId].price;
      resolvedPlanName = plans[planId].name;
    } else if (hasValidActivePlan && currentPlan) {
      resolvedPlanId = currentPlan.id as PlanId;
      paymentAmount = currentPlan.price;
      resolvedPlanName = currentPlan.name;
    } else {
      return errorResponse("You must select a valid subscription plan before submitting payment", 400);
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
      planId: resolvedPlanId,
      planName: resolvedPlanName,
    };

    await createPayment(session.userId, newPayment);

    const updates: Partial<Record<string, any>> = {
      approvalStatus: "pending",
    };

    if (!hasValidActivePlan) {
      updates.status = "inactive";
      updates.planName = "No Plan";
      updates.priceUSD = 0;
      updates.expiryDate = "";
    }

    await updateSubscription(session.userId, updates);

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
