export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import {
  applyPlanRenames,
  getPlatformSettings,
  isSettingsPasswordConfigured,
  isValidContactNumber,
  savePlatformSettings,
  verifySettingsPassword,
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
    return successResponse(
      { settings, passwordConfigured: isSettingsPasswordConfigured() },
      "Settings retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json().catch(() => ({}));
    const settingsPassword =
      typeof body.settingsPassword === 'string' ? body.settingsPassword : '';

    if (!isSettingsPasswordConfigured()) {
      return errorResponse(
        "Settings are locked: CHANGE_SETTINGS_PASSWORD is not configured on the server",
        503
      );
    }

    if (!settingsPassword) {
      return errorResponse("Settings password is required", 400);
    }

    if (!verifySettingsPassword(settingsPassword)) {
      return errorResponse("Incorrect settings password", 401);
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

    if (typeof updates.supportContactNumber === 'string') {
      if (!updates.supportContactNumber.trim()) {
        return errorResponse("Support contact number is required", 400);
      }
      if (!isValidContactNumber(updates.supportContactNumber)) {
        return errorResponse(
          "Enter a valid support number (7-15 digits, e.g. +256 793 704987)",
          400
        );
      }
    }

    // Payment numbers are optional (an empty value hides that gateway), but a
    // filled-in one must still be a real phone number.
    for (const field of ['airtelMoneyNumber', 'mtnMomoNumber'] as const) {
      const value = updates[field];
      if (value && value.trim() && !isValidContactNumber(value)) {
        return errorResponse(
          `Enter a valid phone number for ${field === 'airtelMoneyNumber' ? 'Airtel Money' : 'MTN MoMo'}`,
          400
        );
      }
    }

    if (incoming.plans && typeof incoming.plans === 'object') {
      const plans: Partial<Record<PlanId, EditablePlan>> = {};

      for (const planId of PLAN_ORDER) {
        const plan = incoming.plans[planId];
        if (!plan || typeof plan !== 'object') continue;

        const name = typeof plan.name === 'string' ? plan.name.trim() : '';
        if (!name) {
          return errorResponse(`Plan name is required for the ${planId} plan`, 400);
        }

        const price = typeof plan.price === 'number' ? plan.price : Number(plan.price);
        if (!Number.isFinite(price) || price <= 0) {
          return errorResponse(`Enter a valid price for "${name}"`, 400);
        }

        const features = Array.isArray(plan.features)
          ? plan.features
              .filter((f: unknown): f is string => typeof f === 'string')
              .map((f: string) => f.trim())
              .filter(Boolean)
          : [];
        if (!features.length) {
          return errorResponse(`"${name}" needs at least one feature`, 400);
        }

        plans[planId] = {
          name,
          price,
          description: typeof plan.description === 'string' ? plan.description.trim() : '',
          recommendedAccount:
            typeof plan.recommendedAccount === 'string' ? plan.recommendedAccount.trim() : '',
          bestFor: typeof plan.bestFor === 'string' ? plan.bestFor.trim() : '',
          expectedProfit:
            typeof plan.expectedProfit === 'string' ? plan.expectedProfit.trim() : '',
          features,
        };
      }

      const names = PLAN_ORDER.map((id) => plans[id]?.name).filter(Boolean) as string[];
      if (new Set(names).size !== names.length) {
        return errorResponse("Each plan needs a distinct name", 400);
      }

      updates.plans = plans as Record<PlanId, EditablePlan>;
    }

    // Subscriptions are stored by plan name, so a rename has to be carried over
    // to existing subscribers before the new names go live.
    const previous = await getPlatformSettings();
    const renames: Record<string, string> = {};
    if (updates.plans) {
      for (const planId of PLAN_ORDER) {
        const before = previous.plans[planId]?.name;
        const after = updates.plans[planId]?.name;
        if (before && after && before !== after) {
          renames[before] = after;
        }
      }
    }

    const settings = await savePlatformSettings(updates);
    const renamedSubscriptions = await applyPlanRenames(renames);

    return successResponse(
      { settings, renamedSubscriptions },
      renamedSubscriptions > 0
        ? `Settings updated. ${renamedSubscriptions} subscription${renamedSubscriptions === 1 ? '' : 's'} moved to the new plan name.`
        : "Settings updated",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
