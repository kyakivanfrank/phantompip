import SubscriptionClient from './SubscriptionClient';
import { requireAuth } from '@/lib/server/auth';
import { getUser } from '@/lib/server/db';

export default async function Page() {
  const session = await requireAuth();
  const user = await getUser(session.userId);
  
  const MOUNT_PAYABLE = process.env.MOUNT_PAYABLE;

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

  // 3. Airtel Money Merchant Code Gatewayt
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
  const isActive = subscription?.status === 'active' && subscription?.approvalStatus === 'approved';
  const expiryDate = subscription?.expiryDate ? new Date(subscription.expiryDate) : null;
  const daysRemaining = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)) : 0;

  return (
    <div className="space-y-6">
      {/* Current Subscription Info */}
      {isActive && subscription && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Current Subscription</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Plan</p>
                  <p className="text-sm font-semibold text-green-300">{subscription.planName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <p className="text-sm font-semibold text-green-300">Active</p>
                </div>
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
              </div>
            </div>
          </div>
        </div>
      )}

      <SubscriptionClient paymentDetails={paymentDetails} />
    </div>
  );
}