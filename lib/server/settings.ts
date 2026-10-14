import { getSupabase } from "./supabase";
import { getUser } from "./db";
import { verifyPassword } from "./hashing";
import { DEFAULT_PAYMENT_SETTINGS, DEFAULT_TELEGRAM_LINK } from "@/lib/constants";
import { PLANS, PLAN_ORDER, type PlanDefinition, type PlanId } from "@/lib/plans";

/**
 * Runtime-editable platform settings.
 *
 * The support contact, the payment destinations and the subscription plan
 * details are stored in Supabase Postgres (platform_settings and plans tables)
 * so an admin can change them at any time from Admin -> Settings without a redeploy.
 *
 * Editing requires the admin to re-enter their own login password.
 */

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
  telegramSupportLink: string;

  cryptoBtcAddress: string;
  cryptoBep20Address: string;
  cryptoErc20Address: string;
  activationFee: string;
  plans: Record<PlanId, EditablePlan>;
}

export const SETTINGS_TEXT_FIELDS = [
  "telegramSupportLink",

  "cryptoBtcAddress",
  "cryptoBep20Address",
  "cryptoErc20Address",
  "activationFee",
] as const;

export type SettingsTextField = (typeof SETTINGS_TEXT_FIELDS)[number];

const PHONE_FIELDS: SettingsTextField[] = ["telegramSupportLink"];

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

/** Seed values, used only until an admin saves settings for the first time. */
function seedDefaults(): PlatformSettings {
  return {
    telegramSupportLink: DEFAULT_TELEGRAM_LINK,
    ...DEFAULT_PAYMENT_SETTINGS,
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

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const defaults = seedDefaults();

  try {
    const supabase = getSupabase();

    const [settingsRes, plansRes] = await Promise.all([
      supabase.from("platform_settings").select("*").eq("id", true).maybeSingle(),
      supabase.from("plans").select("*"),
    ]);

    if (settingsRes.error) {
      console.error("Failed to read platform_settings from Supabase:", settingsRes.error);
    }

    const settingsRow = settingsRes.data;
    const plansRows = plansRes.data || [];

    const result: PlatformSettings = { ...defaults, plans: { ...defaults.plans } };

    if (settingsRow) {
      if (settingsRow.telegram_support_link !== null && settingsRow.telegram_support_link !== undefined) {
        result.telegramSupportLink = String(settingsRow.telegram_support_link);
      }
      if (settingsRow.crypto_btc_address !== null && settingsRow.crypto_btc_address !== undefined) {
        result.cryptoBtcAddress = String(settingsRow.crypto_btc_address);
      }
      if (settingsRow.crypto_bep20_address !== null && settingsRow.crypto_bep20_address !== undefined) {
        result.cryptoBep20Address = String(settingsRow.crypto_bep20_address);
      }
      if (settingsRow.crypto_erc20_address !== null && settingsRow.crypto_erc20_address !== undefined) {
        result.cryptoErc20Address = String(settingsRow.crypto_erc20_address);
      }
      if (settingsRow.activation_fee !== null && settingsRow.activation_fee !== undefined) {
        result.activationFee = String(settingsRow.activation_fee);
      }
    }

    if (plansRows.length > 0) {
      const storedPlans: Record<string, any> = {};
      for (const row of plansRows) {
        storedPlans[row.id] = {
          name: row.name,
          price: Number(row.price),
          description: row.description,
          recommendedAccount: row.recommended_account,
          bestFor: row.best_for,
          expectedProfit: row.expected_profit,
          features: row.features,
        };
      }
      result.plans = coercePlans(storedPlans, defaults.plans);
    }

    return result;
  } catch (error) {
    console.error("Failed to read platform settings:", error);
    return defaults;
  }
}

export async function gettelegramSupportLink(): Promise<string> {
  const settings = await getPlatformSettings();
  return settings.telegramSupportLink;
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

  const supabase = getSupabase();

  const settingsPayload = {
    telegram_support_link: next.telegramSupportLink,
    crypto_btc_address: next.cryptoBtcAddress,
    crypto_bep20_address: next.cryptoBep20Address,
    crypto_erc20_address: next.cryptoErc20Address,
    activation_fee: next.activationFee,
  };

  const plansPayload: Record<string, any> = {};
  for (const [id, plan] of Object.entries(next.plans)) {
    plansPayload[id] = {
      name: plan.name,
      price: plan.price,
      description: plan.description,
      recommendedAccount: plan.recommendedAccount,
      bestFor: plan.bestFor,
      expectedProfit: plan.expectedProfit,
      features: plan.features,
    };
  }

  const { error } = await supabase.rpc("app_save_settings", {
    p_settings: settingsPayload,
    p_plans: plansPayload,
  });

  if (error) {
    throw new Error(`Failed to save platform settings: ${error.message}`);
  }

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

  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("app_rename_plans", {
    p_renames: renames,
  });

  if (error) {
    throw new Error(`Failed to apply plan renames: ${error.message}`);
  }

  return typeof data === "number" ? data : 0;
}

/**
 * Saving settings is confirmed with the admin's own login password, so there is
 * no second credential to keep in sync and a rotated admin password takes
 * effect here immediately.
 */
export async function verifyAdminPassword(userId: string, candidate: string): Promise<boolean> {
  if (!candidate) return false;

  const user = await getUser(userId);
  if (!user?.account?.passwordHash) return false;

  return await verifyPassword(candidate, user.account.passwordHash);
}
