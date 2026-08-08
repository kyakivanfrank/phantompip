import SubscriptionClient from './SubscriptionClient';
import { requireAuth } from '@/lib/server/auth';
import { getUser } from '@/lib/server/db';
import { isValidPlanId, getPlan, PLANS } from '@/lib/plans';

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const session = await requireAuth();
  const user = await getUser(session.userId);
  const resolvedParams = await searchParams;

  // Determine selected plan from query param, fallback to user's current plan
  const planIdParam = resolvedParams?.plan || '';
  let selectedPlanId = isValidPlanId(planIdParam) ? planIdParam : null;

  // If no plan param, try to infer from user's current subscription
  if (!selectedPlanId && user?.subscription?.planName) {
    const currentPlan = Object.values(PLANS).find(p => p.name === user.subscription.planName);
    if (currentPlan) {
      selectedPlanId = currentPlan.id;
    }
  }

  // Default to starter if nothing matches
  if (!selectedPlanId) {
    selectedPlanId = 'starter';
  }

  const plan = getPlan(selectedPlanId);
  const MOUNT_PAYABLE = plan.price;

  const paymentDetails: Record<string, any> = {};

  // 1. USDT TRC20 Gateway
  if (process.env.USDT_WALLET_ADDRESS) {
    paymentDetails['USDT-TRC20'] = {
      label: 'USDT (TRON/TRC20)',
      amount: `$${MOUNT_PAYABLE} USDT`,
      address: process.env.USDT_WALLET_ADDRESS,
      accountName: 'Network: TRON (TRC20)',
      helperText: 'Provide the blockchain transaction hash/ID below after completing your transfer.',
    };
  }

  // 2. MTN Mobile Money Gateway (Stays hidden if unconfigured in .env)
  if (process.env.MTN_MOMO_NUMBER && process.env.MTN_MOMO_NUMBER_ACCOUNT_NAME) {
    paymentDetails['MTN-MoMo'] = {
      label: 'MTN Mobile Money',
      amount: `USD ${MOUNT_PAYABLE} (pay the equivalent of $${MOUNT_PAYABLE})`,
      address: process.env.MTN_MOMO_NUMBER,
      accountName: `Account Name: ${process.env.MTN_MOMO_NUMBER_ACCOUNT_NAME}`,
      helperText: 'Send the exact USD-equivalent amount to the mobile number above. Verify the account name matches before sending.',
    };
  }

  // 3. Airtel Money Merchant Code Gateway
  if (process.env.AIRTEL_MONEY_MERCHANT_CODE && process.env.AIRTEL_MONEY_MERCHANT_CODE_NAME) {
    paymentDetails['Airtel-Merchant'] = {
      label: 'Airtel Merchant Code',
      amount: `USD ${MOUNT_PAYABLE} (pay the equivalent of $${MOUNT_PAYABLE})`,
      address: process.env.AIRTEL_MONEY_MERCHANT_CODE,
      accountName: `Merchant Name: ${process.env.AIRTEL_MONEY_MERCHANT_CODE_NAME}`,
      helperText: 'Use your Airtel Money menu to Pay Merchant using the code above. Verify the merchant name matches before confirming.',
    };
  }

  // 4. Airtel Money Mobile Number Gateway
  if (process.env.AIRTEL_MONEY_NUMBER && process.env.AIRTEL_MONEY_NUMBER_ACCOUNT_NAME) {
    paymentDetails['Airtel-Money'] = {
      label: 'Airtel Mobile Number',
      amount: `USD ${MOUNT_PAYABLE} (pay the equivalent of $${MOUNT_PAYABLE})`,
      address: process.env.AIRTEL_MONEY_NUMBER,
      accountName: `Account Name: ${process.env.AIRTEL_MONEY_NUMBER_ACCOUNT_NAME}`,
      helperText: 'Send the exact USD-equivalent amount directly to the mobile number above. Verify the name matches before sending.',
    };
  }

  // Format subscription data for display
  const subscription = user?.subscription;
  if (subscription) {
    const matched = Object.values(PLANS).find(p => p.name === subscription.planName);
    subscription.planName = matched ? matched.name : 'No Plan';
  }
  const isActive = subscription?.status === 'active' && subscription?.approvalStatus === 'approved';
  const expiryDate = subscription?.expiryDate ? new Date(subscription.expiryDate) : null;
  const daysRemaining = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : 0;

  const isCurrentPlan = subscription?.planName === plan.name;

  return (
    <div className="space-y-6">
      {/* Plan Details Card */}
      <div className={`rounded-xl border ${isActive && isCurrentPlan ? 'border-green-500/30 bg-green-500/5' : 'border-purple-500/30 bg-purple-500/5'} p-6 backdrop-blur-xl`}>
        <div className="flex items-start justify-between gap-4">
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h2 className="text-lg font-semibold text-white">
                {isActive && isCurrentPlan ? 'Your Subscription' : 'Selected Plan'}
              </h2>
              {isActive && isCurrentPlan && (
                <span className="w-fit rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-medium text-green-400 border border-green-500/30">
                  Active
                </span>
              )}
              {isActive && !isCurrentPlan && (
                <span className="w-fit rounded-full bg-blue-500/20 px-2.5 py-1 text-xs font-medium text-blue-400 border border-blue-500/30">
                  Upgrading from {subscription.planName}
                </span>
              )}
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">Plan</p>
                <p className={`text-sm font-semibold ${isActive && isCurrentPlan ? 'text-green-300' : 'text-purple-300'}`}>{plan.name}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-400 mb-1">Monthly Price</p>
                <p className={`text-sm font-semibold ${isActive && isCurrentPlan ? 'text-green-300' : 'text-purple-300'}`}>${plan.price}/month</p>
              </div>

              {isActive && isCurrentPlan ? (
                <>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Billing Cycle</p>
                    <p className="text-sm font-semibold text-green-300 capitalize">{subscription.billingCycle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Expires</p>
                    <p className="text-sm font-semibold text-green-300">
                      {expiryDate?.toLocaleDateString()} ({daysRemaining} days)
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Best For</p>
                    <p className="text-sm font-semibold text-purple-300">{plan.bestFor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Expected Monthly Profit</p>
                    <p className="text-sm font-semibold text-green-400">{plan.expectedProfit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Recommended Account</p>
                    <p className="text-sm font-semibold text-purple-300">{plan.recommendedAccount}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <SubscriptionClient paymentDetails={paymentDetails} planId={selectedPlanId} />
    </div>
  );
}