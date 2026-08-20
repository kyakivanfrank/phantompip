/**
 * Subscription Plan Definitions
 *
 * Central source of truth for all plan metadata, pricing, and features.
 * Every part of the app (UI, API, payment logic) must reference these constants.
 */

export type PlanId = 'starter' | 'elite' | 'pulse_pro';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  price: number;
  description: string;
  recommendedAccount: string;
  bestFor: string;
  expectedProfit: string;
  features: string[];
  isPopular?: boolean;
  isFlagship?: boolean;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  starter: {
    id: 'starter',
    name: 'Starter Scalper',
    price: 70,
    description:
      'A reliable entry-level trading bot designed for traders who want smart, accurate, and disciplined trade execution.',
    recommendedAccount: '$10 - $200',
    bestFor: 'Beginners and small account traders',
    expectedProfit: '$100 – $200',
    features: [
      'Smart trade entries',
      'Accurate market filtering',
      'Low-to-moderate risk profile',
      'Gold & major forex pairs support',
      'Stable growth-oriented strategy',
      'Beginner-friendly setup',
    ],
  },
  elite: {
    id: 'elite',
    name: 'Elite Scalper',
    price: 120,
    description:
      'An advanced scalper with faster execution, smarter market analysis, and higher trade frequency.',
    recommendedAccount: '$15 - $200',
    bestFor: 'Traders seeking faster account growth',
    expectedProfit: '$200 – $800',
    isPopular: true,
    features: [
      'Advanced scalping engine',
      'Faster trade execution',
      'Enhanced trend detection',
      'Gold, Bitcoin & major forex pairs',
      'Priority support',
      'Optimized for active market sessions',
    ],
  },
  pulse_pro: {
    id: 'pulse_pro',
    name: 'Pulse Pro Scalper',
    price: 200,
    description:
      'The ultimate high-performance automated scalper. Built for maximum speed, aggressive entries, and dominant market performance.',
    recommendedAccount: '$30 - $500',
    bestFor: 'Serious traders & prop firm challengers',
    expectedProfit: '$1000 – $5000',
    isFlagship: true,
    features: [
      'Ultra-fast scalping execution',
      'Aggressive smart-entry system',
      'High-volatility trade detection',
      'Gold, Bitcoin & major forex pairs',
      'VIP support & premium monitoring',
      'Optimized for rapid market movements',
    ],
  },
} as const;

/** Ordered list of plan IDs for consistent rendering */
export const PLAN_ORDER: PlanId[] = ['starter', 'elite', 'pulse_pro'];

/** Lookup plan by ID with type safety */
export function getPlan(planId: PlanId): PlanDefinition {
  return PLANS[planId];
}

/** Get plan price by ID */
export function getPlanPrice(planId: PlanId): number {
  return PLANS[planId].price;
}

/** Check if a string is a valid PlanId */
export function isValidPlanId(value: string | null | undefined): value is PlanId {
  return value === 'starter' || value === 'elite' || value === 'pulse_pro';
}