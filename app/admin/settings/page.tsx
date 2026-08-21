'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, SlidersHorizontal, ShieldCheck, Layers } from 'lucide-react';
import { invalidatePublicSettings } from '@/lib/hooks';
import { PLAN_ORDER, type PlanId } from '@/lib/plans';

/** Plan fields as the form holds them: price and features are edited as text. */
type PlanForm = {
  name: string;
  price: string;
  expectedProfit: string;
  recommendedAccount: string;
  bestFor: string;
  description: string;
  features: string;
};

const EMPTY_PLAN: PlanForm = {
  name: '',
  price: '',
  expectedProfit: '',
  recommendedAccount: '',
  bestFor: '',
  description: '',
  features: '',
};

const EMPTY_PLANS = PLAN_ORDER.reduce((acc, planId) => {
  acc[planId] = { ...EMPTY_PLAN };
  return acc;
}, {} as Record<PlanId, PlanForm>);

const PLAN_FIELDS: Array<{ field: keyof PlanForm; label: string; placeholder: string; wide?: boolean }> = [
  { field: 'name', label: 'Plan name', placeholder: 'Starter Scalper' },
  { field: 'price', label: 'Price (USD / month)', placeholder: '70' },
  { field: 'expectedProfit', label: 'Expected daily profit', placeholder: '$100 – $200' },
  { field: 'recommendedAccount', label: 'Recommended account', placeholder: '$10 - $200' },
  { field: 'bestFor', label: 'Best for', placeholder: 'Beginners and small account traders' },
];

/** API shape (typed price, array of features) -> form shape (all text). */
function toPlanForms(apiPlans: any): Record<PlanId, PlanForm> {
  return PLAN_ORDER.reduce((acc, planId) => {
    const plan = apiPlans?.[planId] || {};
    acc[planId] = {
      name: plan.name ?? '',
      price: plan.price === undefined || plan.price === null ? '' : String(plan.price),
      expectedProfit: plan.expectedProfit ?? '',
      recommendedAccount: plan.recommendedAccount ?? '',
      bestFor: plan.bestFor ?? '',
      description: plan.description ?? '',
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
    };
    return acc;
  }, {} as Record<PlanId, PlanForm>);
}

/** Form shape -> API shape. */
function toPlanPayload(planForms: Record<PlanId, PlanForm>) {
  return PLAN_ORDER.reduce((acc, planId) => {
    const plan = planForms[planId];
    acc[planId] = {
      name: plan.name.trim(),
      price: Number(plan.price),
      expectedProfit: plan.expectedProfit.trim(),
      recommendedAccount: plan.recommendedAccount.trim(),
      bestFor: plan.bestFor.trim(),
      description: plan.description.trim(),
      features: plan.features
        .split('\n')
        .map((feature) => feature.trim())
        .filter(Boolean),
    };
    return acc;
  }, {} as Record<PlanId, any>);
}

type PlatformSettingsForm = {
  supportContactNumber: string;
  usdtWalletAddress: string;
  airtelMoneyNumber: string;
  airtelMoneyAccountName: string;
  airtelMoneyMerchantCode: string;
  airtelMoneyMerchantCodeName: string;
  mtnMomoNumber: string;
  mtnMomoAccountName: string;
};

const EMPTY_SETTINGS: PlatformSettingsForm = {
  supportContactNumber: '',
  usdtWalletAddress: '',
  airtelMoneyNumber: '',
  airtelMoneyAccountName: '',
  airtelMoneyMerchantCode: '',
  airtelMoneyMerchantCodeName: '',
  mtnMomoNumber: '',
  mtnMomoAccountName: '',
};

const SETTINGS_GROUPS: Array<{
  title: string;
  hint: string;
  fields: Array<{ field: keyof PlatformSettingsForm; label: string; placeholder: string; type?: string }>;
}> = [
  {
    title: 'Support',
    hint: 'Shown on the login, signup, dashboard and support pages.',
    fields: [
      { field: 'supportContactNumber', label: 'Official support number', placeholder: '+256 793 704987', type: 'tel' },
    ],
  },
  {
    title: 'USDT (TRC20)',
    hint: 'Leave blank to hide this payment option from subscribers.',
    fields: [
      { field: 'usdtWalletAddress', label: 'USDT wallet address (TRON)', placeholder: 'TPkbb...' },
    ],
  },
  {
    title: 'Airtel Money',
    hint: 'A gateway only appears once both its number/code and its name are filled in.',
    fields: [
      { field: 'airtelMoneyNumber', label: 'Airtel mobile number', placeholder: '0731020815', type: 'tel' },
      { field: 'airtelMoneyAccountName', label: 'Airtel account name', placeholder: 'Michael' },
      { field: 'airtelMoneyMerchantCode', label: 'Airtel merchant code', placeholder: '7121441' },
      { field: 'airtelMoneyMerchantCodeName', label: 'Airtel merchant name', placeholder: 'Micheal PhantomPip' },
    ],
  },
  {
    title: 'MTN Mobile Money',
    hint: 'Both fields are required for this option to appear.',
    fields: [
      { field: 'mtnMomoNumber', label: 'MTN mobile number', placeholder: 'Not configured', type: 'tel' },
      { field: 'mtnMomoAccountName', label: 'MTN account name', placeholder: 'Not configured' },
    ],
  },
];

export default function AdminSettingsPage() {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Platform settings (support contact + payment destinations). Stored in the
  // database so they can change at any time; every save is gated by the
  // settings password.
  const [settings, setSettings] = useState<PlatformSettingsForm>(EMPTY_SETTINGS);
  const [plans, setPlans] = useState<Record<PlanId, PlanForm>>(EMPTY_PLANS);
  const [settingsPassword, setSettingsPassword] = useState('');
  const [showSettingsPassword, setShowSettingsPassword] = useState(false);
  const [passwordConfigured, setPasswordConfigured] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Visibility states for password fields
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Unable to load platform settings');
        }
        if (active) {
          const loaded = data.data?.settings || {};
          setSettings({ ...EMPTY_SETTINGS, ...loaded });
          setPlans(toPlanForms(loaded.plans));
          setPasswordConfigured(data.data?.passwordConfigured !== false);
        }
      } catch (err: any) {
        if (active) setSettingsError(err.message || 'Unable to load platform settings');
      } finally {
        if (active) setIsLoadingSettings(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const updateSetting = (field: keyof PlatformSettingsForm, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSettingsError('');
    setSettingsMessage('');
  };

  const updatePlan = (planId: PlanId, field: keyof PlanForm, value: string) => {
    setPlans((prev) => ({ ...prev, [planId]: { ...prev[planId], [field]: value } }));
    setSettingsError('');
    setSettingsMessage('');
  };

  const handleSettingsSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSettingsMessage('');
    setSettingsError('');

    const digits = settings.supportContactNumber.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      setSettingsError('Enter a valid support number (7-15 digits, e.g. +256 793 704987)');
      return;
    }

    const planPayload = toPlanPayload(plans);
    for (const planId of PLAN_ORDER) {
      const plan = planPayload[planId];
      if (!plan.name) {
        setSettingsError('Every plan needs a name');
        return;
      }
      if (!Number.isFinite(plan.price) || plan.price <= 0) {
        setSettingsError(`Enter a valid price for "${plan.name}"`);
        return;
      }
      if (!plan.features.length) {
        setSettingsError(`"${plan.name}" needs at least one feature`);
        return;
      }
    }

    const planNames = PLAN_ORDER.map((planId) => planPayload[planId].name);
    if (new Set(planNames).size !== planNames.length) {
      setSettingsError('Each plan needs a distinct name');
      return;
    }

    if (!settingsPassword) {
      setSettingsError('Enter the settings password to save changes');
      return;
    }

    setIsSavingSettings(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settingsPassword,
          settings: { ...settings, plans: planPayload },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to update settings');
      }

      const saved = data.data?.settings || {};
      setSettings({ ...EMPTY_SETTINGS, ...saved });
      setPlans(toPlanForms(saved.plans));
      setSettingsPassword('');
      invalidatePublicSettings();
      setSettingsMessage(data.message || 'Settings updated. Changes are live across the site.');
    } catch (err: any) {
      setSettingsError(err.message || 'Unable to update settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Password validation logic
  const passwordRequirements = useMemo(() => [
    { label: 'At least 8 characters', met: passwordForm.newPassword.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(passwordForm.newPassword) },
    { label: 'One lowercase letter', met: /[a-z]/.test(passwordForm.newPassword) },
    { label: 'One number', met: /[0-9]/.test(passwordForm.newPassword) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(passwordForm.newPassword) },
  ], [passwordForm.newPassword]);

  const allRequirementsMet = passwordRequirements.every(r => r.met);
  const showRequirements = isNewPasswordFocused || (passwordForm.newPassword.length > 0 && !allRequirementsMet);
  const passwordsMatch = passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword.length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');

    // Validation
    if (!passwordForm.currentPassword) {
      setError('Current password is required');
      return;
    }

    if (!passwordForm.newPassword) {
      setError('New password is required');
      return;
    }

    if (!allRequirementsMet) {
      setError('New password does not meet all security requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('New password and confirm password do not match');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to update password');
      }

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Admin password updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Unable to update password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold text-white">Admin Settings</h1>
        <p className="mt-1 text-gray-400">Update admin account and platform settings from one place.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass rounded-xl border border-white/[0.08] bg-dark-secondary/40 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-cyan-500/10 p-3 text-cyan-400">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Platform Settings</p>
            <p className="text-sm text-gray-400">Support contact and payment destinations. Changes go live immediately, no redeploy.</p>
          </div>
        </div>

        {!passwordConfigured && (
          <p className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
            CHANGE_SETTINGS_PASSWORD is not set on the server, so these settings are locked. Add it to your environment and restart to enable editing.
          </p>
        )}

        <form onSubmit={handleSettingsSubmit} className="mt-6 space-y-6">
          {SETTINGS_GROUPS.map((group) => (
            <div key={group.title} className="rounded-md border border-white/[0.05] bg-dark-tertiary/20 p-4">
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{group.title}</p>
              <p className="mt-1 text-[11px] text-gray-500">{group.hint}</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {group.fields.map(({ field, label, placeholder, type }) => (
                  <div key={field}>
                    <label className="block text-sm text-gray-400 mb-2">{label}</label>
                    <input
                      type={type || 'text'}
                      value={settings[field]}
                      onChange={(e) => updateSetting(field, e.target.value)}
                      placeholder={isLoadingSettings ? 'Loading...' : placeholder}
                      disabled={isLoadingSettings || !passwordConfigured}
                      className="w-full rounded-lg border border-white/[0.1] bg-dark px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 transition disabled:opacity-60"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-md border border-white/[0.05] bg-dark-tertiary/20 p-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">Subscription Plans</p>
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              Prices, expected profits and features shown on the landing page, the plans page and at checkout.
              Renaming a plan also moves existing subscribers to the new name.
            </p>

            <div className="mt-4 space-y-4">
              {PLAN_ORDER.map((planId) => (
                <div key={planId} className="rounded-md border border-white/[0.06] bg-dark/40 p-4">
                  <p className="text-xs font-semibold text-purple-300">
                    {plans[planId].name || planId}
                  </p>

                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {PLAN_FIELDS.map(({ field, label, placeholder }) => (
                      <div key={field}>
                        <label className="block text-sm text-gray-400 mb-2">{label}</label>
                        <input
                          type={field === 'price' ? 'number' : 'text'}
                          step={field === 'price' ? '0.01' : undefined}
                          min={field === 'price' ? '0' : undefined}
                          value={plans[planId][field]}
                          onChange={(e) => updatePlan(planId, field, e.target.value)}
                          placeholder={isLoadingSettings ? 'Loading...' : placeholder}
                          disabled={isLoadingSettings || !passwordConfigured}
                          className="w-full rounded-lg border border-white/[0.1] bg-dark px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 transition disabled:opacity-60"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm text-gray-400 mb-2">Description</label>
                    <textarea
                      value={plans[planId].description}
                      onChange={(e) => updatePlan(planId, 'description', e.target.value)}
                      rows={2}
                      disabled={isLoadingSettings || !passwordConfigured}
                      className="w-full rounded-lg border border-white/[0.1] bg-dark px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 transition disabled:opacity-60"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm text-gray-400 mb-2">Features (one per line)</label>
                    <textarea
                      value={plans[planId].features}
                      onChange={(e) => updatePlan(planId, 'features', e.target.value)}
                      rows={6}
                      disabled={isLoadingSettings || !passwordConfigured}
                      className="w-full rounded-lg border border-white/[0.1] bg-dark px-3 py-2 font-mono text-xs text-white outline-none focus:border-cyan-500 transition disabled:opacity-60"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <p className="text-sm font-medium text-white">Settings password required</p>
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              These values decide where subscribers send money, so every save must be confirmed with the settings password.
            </p>

            <div className="relative mt-3">
              <input
                type={showSettingsPassword ? 'text' : 'password'}
                value={settingsPassword}
                onChange={(e) => {
                  setSettingsPassword(e.target.value);
                  setSettingsError('');
                  setSettingsMessage('');
                }}
                placeholder="Settings password"
                autoComplete="off"
                disabled={isLoadingSettings || !passwordConfigured}
                className="w-full rounded-lg border border-white/[0.1] bg-dark px-3 py-2 pr-12 text-sm text-white outline-none focus:border-cyan-500 transition disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowSettingsPassword(!showSettingsPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {showSettingsPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingSettings || isLoadingSettings || !passwordConfigured}
            className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-400 transition disabled:cursor-not-allowed disabled:bg-cyan-500/60"
          >
            {isSavingSettings ? 'Saving...' : 'Save settings'}
          </button>

          {settingsMessage && <p className="text-sm text-emerald-400">{settingsMessage}</p>}
          {settingsError && <p className="text-sm text-rose-400">{settingsError}</p>}
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass rounded-xl border border-white/[0.08] bg-dark-secondary/40 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-cyan-500/10 p-3 text-cyan-400">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Change Admin Password</p>
            <p className="text-sm text-gray-400">Use your current password to update the admin login.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Current password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                  setError('');
                }}
                className="w-full rounded-lg border border-white/[0.1] bg-dark px-3 py-2 pr-12 text-sm text-white outline-none focus:border-cyan-500 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">New password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                  setError('');
                }}
                onFocus={() => setIsNewPasswordFocused(true)}
                onBlur={() => setIsNewPasswordFocused(false)}
                className="w-full rounded-lg border border-white/[0.1] bg-dark px-3 py-2 pr-12 text-sm text-white outline-none focus:border-cyan-500 transition"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <AnimatePresence>
            {showRequirements && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-md border border-white/[0.05] bg-dark-tertiary/20 p-3 space-y-2">
                  <p className="text-[10px] text-gray-500 font-mono uppercase">Security Requirements</p>
                  <div className="space-y-1.5">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] transition-colors">
                        <div className={`size-1.5 rounded-full ${req.met ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-gray-600'}`} />
                        <span className={req.met ? 'text-gray-200' : 'text-gray-500'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Confirm new password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                  setError('');
                }}
                className="w-full rounded-lg border border-white/[0.1] bg-dark px-3 py-2 pr-12 text-sm text-white outline-none focus:border-cyan-500 transition"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordForm.confirmPassword && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-xs mt-1 ${passwordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-400 transition disabled:cursor-not-allowed disabled:bg-cyan-500/60"
          >
            {isSaving ? 'Saving...' : 'Update password'}
          </button>

          {message && <p className="text-sm text-emerald-400">{message}</p>}
          {error && <p className="text-sm text-rose-400">{error}</p>}
        </form>
      </motion.div>
    </div>
  );
}
