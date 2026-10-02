export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import {
  getPlatformSettings,
  savePlatformSettings,
  verifyAdminPassword,
  SETTINGS_TEXT_FIELDS,
  type EditablePlan,
  type PlatformSettings,
} from "@/lib/server/settings";
import { PLAN_ORDER, type PlanId } from "@/lib/plans";
import { errorResponse, handleApiError, successResponse } from "@/lib/server/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getPlatformSettings();
    return successResponse({ settings }, "Settings retrieved", 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await request.json().catch(() => ({}));
    const adminPassword =
      typeof body.adminPassword === 'string' ? body.adminPassword : '';

    if (!adminPassword) {
      return errorResponse("Your admin password is required to save settings", 400);
    }

    // These values decide where subscribers send money, so confirm the session
    // really belongs to the admin before anything is written.
    if (!(await verifyAdminPassword(session.userId, adminPassword))) {
      return errorResponse("Incorrect admin password", 401);
    }

    const incoming = body.settings;
    if (!incoming || typeof incoming !== 'object') {
      return errorResponse("No settings provided", 400);
    }

    const updates: Partial<PlatformSettings> = {};

    for (const field of SETTINGS_TEXT_FIELDS) {
      const value = incoming[field];
      if (typeof value === 'string') {
        updates[field] = value;
      }
    }

    if (typeof updates.telegramSupportLink === 'string') {
      if (!updates.telegramSupportLink.trim()) {
        return errorResponse("Telegram link is required", 400);
      }
    }


    const settings = await savePlatformSettings(updates);

    return successResponse(
      { settings },
      "Settings updated",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
