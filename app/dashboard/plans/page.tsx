'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Rocket, ArrowRight, Sparkles } from 'lucide-react';
import { PLANS, PLAN_ORDER, type PlanId } from '@/lib/plans';

const PLAN_ICONS: Record<PlanId, React.ElementType> = {
  starter: Zap,
  elite: Crown,
  pulse_pro: Rocket,
};

const PLAN_ACCENT: Record<PlanId, { border: string; bg: string; text: string; glow: string; btn: string }> = {
  starter: {
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/5',
    text: 'text-cyan-400',
    glow: 'bg-cyan-500/10',
    btn: 'bg-cyan-600 hover:bg-cyan-700',
  },
  elite: {
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/5',
    text: 'text-purple-400',
    glow: 'bg-purple-500/15',
    btn: 'bg-purple-600 hover:bg-purple-700',
  },
  pulse_pro: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    text: 'text-amber-400',
    glow: 'bg-amber-500/10',
    btn: 'bg-amber-600 hover:bg-amber-700',
  },
};

export default function PlansPage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const user = data?.data?.user;
        const planName = user?.subscription?.isActive ? user.subscription.planName : '';
        let resolvedPlanName = null;
        if (planName) {
          const matched = Object.values(PLANS).find(p => p.name === planName);
          if (matched) resolvedPlanName = matched.name;
        }
        setCurrentPlan(resolvedPlanName);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleChoosePlan = (planId: PlanId) => {
    router.push(`/dashboard/subscription?plan=${planId}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-semibold text-white">Choose Your Plan</h1>
        </div>
        <p className="text-gray-400">
          Select a subscription plan to activate AI-powered trading automation on your MT5 account.
        </p>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {PLAN_ORDER.map((planId, index) => {
          const plan = PLANS[planId];
          const accent = PLAN_ACCENT[planId];
          const Icon = PLAN_ICONS[planId];
          const isCurrentPlan = currentPlan === plan.name;

          return (
            <motion.div
              key={planId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col overflow-hidden rounded-2xl border-2 ${
                plan.isPopular ? accent.border : 'border-white/[0.08]'
              } ${accent.bg} backdrop-blur-xl transition-all hover:border-opacity-60`}
            >
              {/* Popular / Flagship Badge */}
              {plan.isPopular && (
                <div className="absolute -top-px left-0 right-0 flex justify-center">
                  <span className="rounded-b-lg bg-purple-600 px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              {plan.isFlagship && (
                <div className="absolute -top-px left-0 right-0 flex justify-center">
                  <span className="rounded-b-lg bg-amber-600 px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg">
                    Flagship
                  </span>
                </div>
              )}

              {/* Glow effect for popular plan */}
              {plan.isPopular && (
                <div className={`pointer-events-none absolute -inset-4 -z-10 ${accent.glow} blur-3xl`} />
              )}

              <div className={`flex flex-col flex-1 p-6 ${plan.isPopular || plan.isFlagship ? 'pt-10' : ''}`}>
                {/* Icon + Name */}
                <div className="flex items-center gap-3">
                  <div className={`grid size-10 place-items-center rounded-xl ${accent.bg} border ${accent.border}`}>
                    <Icon className={`h-5 w-5 ${accent.text}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">{plan.bestFor}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-mono text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-sm text-gray-400">/month</span>
                </div>

                {/* Description */}
                <p className="mt-4 text-sm leading-relaxed text-gray-400">
                  {plan.description}
                </p>

                {/* Expected Profit */}
                <div className="mt-4 rounded-lg border border-green-500/[0.15] bg-green-500/[0.05] px-3 py-2">
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-green-500/70">Expected Monthly Profit</p>
                  <p className="mt-1 text-sm font-semibold text-green-400">{plan.expectedProfit}</p>
                </div>

                {/* Recommended Account */}
                <div className="mt-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2">
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-500">Recommended Account</p>
                  <p className={`mt-1 text-sm font-semibold ${accent.text}`}>{plan.recommendedAccount}</p>
                </div>

                {/* Features */}
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${accent.text}`} />
                      <span className="text-white/85">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleChoosePlan(planId)}
                  disabled={isCurrentPlan}
                  className={`mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCurrentPlan
                      ? 'bg-green-600/20 border border-green-500/30 text-green-400'
                      : accent.btn
                  }`}
                >
                  {isCurrentPlan ? (
                    <>
                      <Check className="h-4 w-4" /> Current Plan
                    </>
                  ) : (
                    <>
                      Choose Plan <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Payment Methods Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-mono uppercase tracking-[0.22em] text-gray-400"
      >
        <span>Accepted payments</span>
        {['USDT · TRC20', 'Airtel Money', 'MTN MoMo'].map((method, i) => (
          <span key={i} className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1">
            {method}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
