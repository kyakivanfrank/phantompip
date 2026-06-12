export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getUser } from "@/lib/server/db";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";

export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuth();
    const user = await getUser(session.userId);

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const now = Date.now();
    const expiryTimestamp = new Date(user.subscription.expiryDate).getTime();
    const remainingDays = Number.isFinite(expiryTimestamp)
      ? Math.max(0, Math.ceil((expiryTimestamp - now) / (1000 * 60 * 60 * 24)))
      : 0;
    const isSubscriptionActive =
      user.subscription.status === "active" &&
      user.subscription.approvalStatus === "approved" &&
      expiryTimestamp > now;

    const sortedPayments = [...(user.subscription.payments || [])].sort(
      (left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime()
    );
    const latestConfirmedPayment = sortedPayments.find((payment) => payment.status === "confirmed") || null;
    const latestPayment = sortedPayments[0] || null;

    return successResponse(
      {
        user: {
          id: session.userId,
          email: user.account.email,
          username: user.account.username,
          isAdmin: session.isAdmin,
          accountStatus: user.subscription.status,
          subscriptionExpiresAt: expiryTimestamp,
          createdAt: new Date(user.account.createdAt).getTime(),
          mt5Connected: user.mt5?.isConnected ?? false,
          subscription: {
            status: user.subscription.status,
            approvalStatus: user.subscription.approvalStatus,
            isActive: isSubscriptionActive,
            planName: user.subscription.planName,
            billingCycle: user.subscription.billingCycle,
            expiryDate: user.subscription.expiryDate,
            expiryTimestamp,
            remainingDays,
            paidAmount: latestConfirmedPayment?.amount ?? user.subscription.priceUSD ?? 0,
            latestPaymentStatus: latestPayment?.status ?? null,
            latestPaymentMethod: latestPayment?.method ?? null,
            latestPaymentSubmittedAt: latestPayment?.submittedAt ?? null,
          },
          mt5: {
            isConnected: user.mt5?.isConnected ?? false,
            loginId: user.mt5?.loginId ?? "",
            brokerServer: user.mt5?.brokerServer ?? "",
            connectedAt: user.mt5?.connectedAt ?? null,
          },
        },
      },
      "User profile retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
