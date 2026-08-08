export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { buildAdminUserDetails } from "@/lib/server/admin-user";
import { getUser, deleteUser, setMt5Credentials, updateSubscription } from "@/lib/server/db";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";

function toExpiryDateIso(timestamp: number) {
  return new Date(timestamp).toISOString().split("T")[0];
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();
    const { userId } = await context.params;
    const details = await buildAdminUserDetails(userId);

    if (!details) {
      return errorResponse("User not found", 404);
    }

    return successResponse({ user: details }, "Admin user details retrieved", 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();
    const { userId } = await context.params;
    const user = await getUser(userId);

    if (!user) {
      return errorResponse("User not found", 404);
    }

    const body = await request.json();
    const action = body?.action;

    if (action === "extendSubscription") {
      const extensionDays = Number(body?.days) > 0 ? Number(body.days) : 30;
      const now = Date.now();
      const currentExpiry = new Date(user.subscription.expiryDate).getTime();
      const baseTimestamp = Number.isFinite(currentExpiry) ? Math.max(now, currentExpiry) : now;
      const nextExpiryTimestamp = baseTimestamp + extensionDays * 24 * 60 * 60 * 1000;

      await updateSubscription(userId, {
        status: "active",
        approvalStatus: "approved",
        approvedAt: new Date().toISOString(),
        expiryDate: toExpiryDateIso(nextExpiryTimestamp),
      });
    } else if (action === "resetMt5") {
      await setMt5Credentials(userId, {
        loginId: "",
        password: "",
        brokerServer: "",
        connectedAt: null,
        isConnected: false,
      });
    } else if (action === "expireSubscription") {
      await updateSubscription(userId, {
        status: "expired",
        expiryDate: toExpiryDateIso(Date.now()),
      });
    } else if (action === "changePlan") {
      const newPlanName = body?.planName;
      let updates: Record<string, any> = {};

      if (newPlanName === "No Plan") {
        updates = {
          status: "inactive",
          approvalStatus: "none",
          planName: "No Plan",
          priceUSD: 0,
          expiryDate: "",
        };
      } else {
        let newPriceUSD = 50; // default Starter price
        if (newPlanName === "Elite Scalper") newPriceUSD = 120;
        if (newPlanName === "Pulse Pro Scalper") newPriceUSD = 200;

        updates = {
          planName: newPlanName,
          priceUSD: newPriceUSD,
        };
      }

      if (newPlanName) {
        await updateSubscription(userId, updates);
      }
    } else {
      return errorResponse("Unsupported admin action", 400);
    }

    const details = await buildAdminUserDetails(userId);

    if (!details) {
      return errorResponse("User not found after update", 404);
    }

    return successResponse({ user: details }, "Admin action completed", 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    await requireAdmin();
    const { userId } = await context.params;

    const user = await getUser(userId);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Safety: prevent deleting admin accounts via this endpoint
    if (user.isAdmin) {
      return errorResponse("Cannot delete admin accounts", 403);
    }

    await deleteUser(userId);

    return successResponse({ userId }, "User account permanently deleted", 200);
  } catch (error) {
    return handleApiError(error);
  }
}