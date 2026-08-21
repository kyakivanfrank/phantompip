import { timingSafeEqual } from "crypto";
import {
  getRedis,
  attempt,
  triggerOptimisticBackup,
  getAllUsers,
  getUser,
  updateSubscription,
  mapWithConcurrency,
} from "./db";
import { DEFAULT_PAYMENT_SETTINGS, DEFAULT_SUPPORT_CONTACT_NUMBER } from "@/lib/constants";
import { PLANS, PLAN_ORDER, type PlanDefinition, type PlanId } from "@/lib/plans";

/**
 * Runtime-editable platform settings.
 *
 * The support contact, the payment destinations and the subscription plan
 * details used to live in .env / lib/plans.ts. They now live in Redis so an
 * admin can change them at any time from Admin -> Settings without a redeploy.
 * The code-level values in lib/constants.ts and lib/plans.ts stay as the seed
 * used by a database that has never been written to.
 *
 * Editing requires CHANGE_SETTINGS_PASSWORD (env only - it is a credential,
 * never stored in or served from the database).
 */

const SETTINGS_KEY = "system:settings";
const LEGACY_SUPPORT_CONTACT_KEY = "system:support_contact_number";

/** Plan fields an admin may edit. Ids and marketing flags stay code-owned. */
export const EDITABLE_PLAN_FIELDS = [
  "name",
  "price",
  "description",
  "recommendedAccount",
  "bestFor",
  "expectedProfit",
  "features",
] as const;

export type EditablePlan = Pick<PlanDefinition, (typeof EDITABLE_PLAN_FIELDS)[number]>;

export interface PlatformSettings {
  supportContactNumber: string;
  usdtWalletAddress: string;
  airtelMoneyNumber: string;
  airtelMoneyAccountName: string;
  airtelMoneyMerchantCode: string;
  airtelMoneyMerchantCodeName: string;
  mtnMomoNumber: string;
  mtnMomoAccountName: string;
  plans: Record<PlanId, EditablePlan>;
}

export const SETTINGS_TEXT_FIELDS = [
  "supportContactNumber",
  "usdtWalletAddress",
  "airtelMoneyNumber",
  "airtelMoneyAccountName",
  "airtelMoneyMerchantCode",
  "airtelMoneyMerchantCodeName",
  "mtnMomoNumber",
  "mtnMomoAccountName",
] as const;

export type SettingsTextField = (typeof SETTINGS_TEXT_FIELDS)[number];

const PHONE_FIELDS: SettingsTextField[] = [
  "supportContactNumber",
  "airtelMoneyNumber",
  "mtnMomoNumber",
];

export function normalizeContactNumber(value: string): string {
  return value.replace(/[^\d+\s()-]/g, "").replace(/\s+/g, " ").trim();
}

export function isValidContactNumber(value: string): boolean {
  const normalized = normalizeContactNumber(value);
  const digits = normalized.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 && /^\+?[\d\s()-]+$/.test(normalized);
}

function seedPlans(): Record<PlanId, EditablePlan> {
  return PLAN_ORDER.reduce((acc, planId) => {
    const plan = PLANS[planId];
    acc[planId] = {
      name: plan.name,
      price: plan.price,
      description: plan.description,
      recommendedAccount: plan.recommendedAccount,
      bestFor: plan.bestFor,
      expectedProfit: plan.expectedProfit,
      features: [...plan.features],
    };
    return acc;
  }, {} as Record<PlanId, EditablePlan>);
}

/**
 * Seed values, used only until an admin saves settings for the first time.
 * Env vars still win if present, so a deployment that has not dropped the old
 * variables yet keeps its current values while migrating.
 */
function seedDefaults(): PlatformSettings {
  return {
    supportContactNumber:
      process.env.NEXT_PUBLIC_SUPPORT_CONTACT_NUMBER?.trim() || DEFAULT_SUPPORT_CONTACT_NUMBER,
    usdtWalletAddress:
      process.env.USDT_WALLET_ADDRESS?.trim() || DEFAULT_PAYMENT_SETTINGS.usdtWalletAddress,
    airtelMoneyNumber:
      process.env.AIRTEL_MONEY_NUMBER?.trim() || DEFAULT_PAYMENT_SETTINGS.airtelMoneyNumber,
    airtelMoneyAccountName:
      process.env.AIRTEL_MONEY_NUMBER_ACCOUNT_NAME?.trim() ||
      DEFAULT_PAYMENT_SETTINGS.airtelMoneyAccountName,
    airtelMoneyMerchantCode:
      process.env.AIRTEL_MONEY_MERCHANT_CODE?.trim() ||
      DEFAULT_PAYMENT_SETTINGS.airtelMoneyMerchantCode,
    airtelMoneyMerchantCodeName:
      process.env.AIRTEL_MONEY_MERCHANT_CODE_NAME?.trim() ||
      DEFAULT_PAYMENT_SETTINGS.airtelMoneyMerchantCodeName,
    mtnMomoNumber: process.env.MTN_MOMO_NUMBER?.trim() || DEFAULT_PAYMENT_SETTINGS.mtnMomoNumber,
    mtnMomoAccountName:
      process.env.MTN_MOMO_NUMBER_ACCOUNT_NAME?.trim() ||
      DEFAULT_PAYMENT_SETTINGS.mtnMomoAccountName,
    plans: seedPlans(),
  };
}

function coercePlans(raw: any, defaults: Record<PlanId, EditablePlan>): Record<PlanId, EditablePlan> {
  const result = seedPlans();

  for (const planId of PLAN_ORDER) {
    result[planId] = { ...defaults[planId] };
    const stored = raw?.[planId];
    if (!stored || typeof stored !== "object") continue;

    if (typeof stored.name === "string" && stored.name.trim()) {
      result[planId].name = stored.name.trim();
    }
    if (typeof stored.price === "number" && Number.isFinite(stored.price) && stored.price >= 0) {
      result[planId].price = stored.price;
    }
    for (const field of ["description", "recommendedAccount", "bestFor", "expectedProfit"] as const) {
      if (typeof stored[field] === "string" && stored[field].trim()) {
        result[planId][field] = stored[field].trim();
      }
    }
    if (Array.isArray(stored.features)) {
      const features = stored.features
        .filter((f: unknown): f is string => typeof f === "string")
        .map((f: string) => f.trim())
        .filter(Boolean);
      if (features.length) result[planId].features = features;
    }
  }

  return result;
}

function coerceStored(raw: unknown, defaults: PlatformSettings): PlatformSettings {
  let parsed: any = raw;

  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ...defaults };
    }
  }

  if (!parsed || typeof parsed !== "object") return { ...defaults };

  const result: PlatformSettings = { ...defaults, plans: defaults.plans };

  for (const field of SETTINGS_TEXT_FIELDS) {
    const value = parsed[field];
    if (typeof value === "string" && value.trim()) {
      result[field] = value.trim();
    }
  }

  result.plans = coercePlans(parsed.plans, defaults.plans);
  return result;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const defaults = seedDefaults();

  try {
    const redis = getRedis();
    const stored = await attempt(() => redis.get(SETTINGS_KEY));
    const settings = coerceStored(stored, defaults);

    if (!stored) {
      // Pre-dates the combined settings key; keep honouring the old standalone value.
      const legacy = await attempt(() => redis.get(LEGACY_SUPPORT_CONTACT_KEY));
      if (typeof legacy === "string" && legacy.trim()) {
        settings.supportContactNumber = legacy.trim();
      }
    }

    return settings;
  } catch (error) {
    console.error("Failed to read platform settings:", error);
    return defaults;
  }
}

export async function getSupportContactNumber(): Promise<string> {
  const settings = await getPlatformSettings();
  return settings.supportContactNumber;
}

/**
 * The live plan catalogue: code-level definitions with the admin's edits
 * applied. Every price, name and profit figure shown to a user comes from here.
 */
export async function getPlans(): Promise<Record<PlanId, PlanDefinition>> {
  const settings = await getPlatformSettings();
  return resolvePlans(settings);
}

export function resolvePlans(settings: PlatformSettings): Record<PlanId, PlanDefinition> {
  return PLAN_ORDER.reduce((acc, planId) => {
    acc[planId] = { ...PLANS[planId], ...settings.plans[planId] };
    return acc;
  }, {} as Record<PlanId, PlanDefinition>);
}

export async function savePlatformSettings(
  updates: Partial<PlatformSettings>
): Promise<PlatformSettings> {
  const current = await getPlatformSettings();
  const next: PlatformSettings = { ...current, plans: { ...current.plans } };

  for (const field of SETTINGS_TEXT_FIELDS) {
    const value = updates[field];
    if (typeof value !== "string") continue;
    next[field] = PHONE_FIELDS.includes(field) ? normalizeContactNumber(value) : value.trim();
  }

  if (updates.plans) {
    next.plans = coercePlans(updates.plans, current.plans);
  }

  const redis = getRedis();
  await attempt(() => redis.set(SETTINGS_KEY, JSON.stringify(next)));
  triggerOptimisticBackup();
  return next;
}

/**
 * Subscriptions are stored by plan NAME, so renaming a plan would orphan every
 * subscriber on it. Rewrite the stored name whenever an admin renames a plan.
 * Returns how many user records were rewritten.
 */
export async function applyPlanRenames(renames: Record<string, string>): Promise<number> {
  const pairs = Object.entries(renames).filter(([from, to]) => from && to && from !== to);
  if (!pairs.length) return 0;

  const lookup = new Map(pairs);
  const index = await getAllUsers();

  const updated = await mapWithConcurrency(
    index.filter((entry) => !entry.isAdmin),
    async (entry) => {
      const user = await getUser(entry.userId);
      const currentName = user?.subscription?.planName;
      if (!currentName) return 0;

      const newName = lookup.get(currentName);
      if (!newName) return 0;

      await updateSubscription(entry.userId, { planName: newName });
      return 1;
    },
    8
  );

  return updated.reduce<number>((total, n) => total + n, 0);
}

export function isSettingsPasswordConfigured(): boolean {
  return Boolean(process.env.CHANGE_SETTINGS_PASSWORD?.trim());
}

/** Constant-time comparison so the gate cannot be probed byte by byte. */
export function verifySettingsPassword(candidate: string): boolean {
  const expected = process.env.CHANGE_SETTINGS_PASSWORD?.trim();
  if (!expected) return false;

  const expectedBuffer = Buffer.from(expected, "utf8");
  const candidateBuffer = Buffer.from(candidate ?? "", "utf8");

  if (expectedBuffer.length !== candidateBuffer.length) {
    // Still burn a comparison to keep the timing profile flat.
    timingSafeEqual(expectedBuffer, expectedBuffer);
    return false;
  }

  return timingSafeEqual(expectedBuffer, candidateBuffer);
}
