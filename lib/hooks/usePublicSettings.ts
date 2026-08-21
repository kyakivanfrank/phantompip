'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_SUPPORT_CONTACT_NUMBER } from '@/lib/constants';
import { PLANS, type PlanDefinition, type PlanId } from '@/lib/plans';

/**
 * Admin-managed values that every visitor may see. They live in the database
 * (Admin -> Settings), so client pages fetch them instead of relying on
 * build-time constants. The code-level defaults render first, which keeps the
 * first paint identical to the server output and free of layout shift.
 */

export interface PublicSettings {
  supportContactNumber: string;
  plans: Record<PlanId, PlanDefinition>;
}

const FALLBACK: PublicSettings = {
  supportContactNumber: DEFAULT_SUPPORT_CONTACT_NUMBER,
  plans: PLANS,
};

// Shared across components so a page showing several of these fetches once.
let cached: PublicSettings | null = null;
let inFlight: Promise<PublicSettings> | null = null;

function fetchPublicSettings(): Promise<PublicSettings> {
  if (cached) return Promise.resolve(cached);

  if (!inFlight) {
    inFlight = fetch('/api/settings/public')
      .then((res) => res.json())
      .then((payload) => {
        const data = payload?.data;
        cached = {
          supportContactNumber:
            typeof data?.supportContactNumber === 'string' && data.supportContactNumber.trim()
              ? data.supportContactNumber.trim()
              : FALLBACK.supportContactNumber,
          plans: data?.plans && typeof data.plans === 'object' ? data.plans : FALLBACK.plans,
        };
        return cached;
      })
      .catch(() => FALLBACK)
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
}

export function usePublicSettings(): PublicSettings {
  const [settings, setSettings] = useState<PublicSettings>(cached || FALLBACK);

  useEffect(() => {
    let active = true;
    fetchPublicSettings().then((value) => {
      if (active) setSettings(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return settings;
}

/** Live official support number, editable by an admin in Admin -> Settings. */
export function useSupportContact(): string {
  return usePublicSettings().supportContactNumber;
}

/** Live plan catalogue (names, prices, expected profits, features). */
export function usePlans(): Record<PlanId, PlanDefinition> {
  return usePublicSettings().plans;
}

/** Clears the cache so a fresh value is fetched (used after an admin update). */
export function invalidatePublicSettings() {
  cached = null;
}
