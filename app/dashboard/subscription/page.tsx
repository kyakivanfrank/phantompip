import SubscriptionClient from './SubscriptionClient';

export default function Page() {
  const MOUNT_PAYABLE = process.env.MOUNT_PAYABLE ?? '49.99';

  const PAYMENT_DETAILS = {
    'USDT-TRC20': {
      label: 'USDT (TRON/TRC20)',
      amount: `$${MOUNT_PAYABLE} USDT`,
      address: process.env.USDT_WALLET_ADDRESS ?? 'TCmyVHKK8G8GYJBvQmDvZW9KCXAXSYyJAV',
      accountName: 'Network: TRON (TRC20)',
      helperText: 'Provide the blockchain transaction hash/ID below after completing your transfer.',
    },
    'MTN-MoMo': {
      label: 'MTN Mobile Money',
      amount: `USD ${MOUNT_PAYABLE} (pay the equivalent of $${MOUNT_PAYABLE})`,
      address: process.env.MTN_MOMO_NUMBER ?? '+256 770 000 000',
      accountName: 'Account Name: PHANTOMPIP TRADING',
      helperText: 'Send the exact USD-equivalent amount to the mobile number above. Verify the account name matches before sending.',
    },
    'Airtel-Money': {
      label: 'Airtel Money',
      amount: `USD ${MOUNT_PAYABLE} (pay the equivalent of $${MOUNT_PAYABLE})`,
      address: process.env.AIRTEL_MONEY_NUMBER ?? '+256 700 000 000',
      accountName: 'Account Name: PHANTOMPIP TRADING',
      helperText: 'Send the exact USD-equivalent amount to the mobile number above. Verify the account name matches before sending.',
    },
  } as const;

  return <SubscriptionClient paymentDetails={PAYMENT_DETAILS as any} />;
}