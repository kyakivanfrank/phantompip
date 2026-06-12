import { getAllUserBotSettings, getUser } from "@/lib/server/db";
import { Bot, Payment, UserDocument } from "@/lib/types";

export interface AdminUserSummary {
  id: string;
  email: string;
  fullName: string;
  accountStatus: string;
  subscriptionStatus: UserDocument["subscription"]["status"];
  approvalStatus: UserDocument["subscription"]["approvalStatus"];
  subscriptionExpiresAt: number;
  createdAt: number;
  mt5Connected: boolean;
  daysRemaining: number;
  paidAmount: number;
  latestPaymentStatus: Payment["status"] | null;
  latestPaymentMethod: Payment["method"] | null;
  latestPaymentSubmittedAt: string | null;
}

export interface AdminUserDetails extends AdminUserSummary {
  userId: string;
  subscription: {
    status: UserDocument["subscription"]["status"];
    approvalStatus: UserDocument["subscription"]["approvalStatus"];
    displayStatus: string;
    planName: string;
    billingCycle: UserDocument["subscription"]["billingCycle"];
    expiryDate: string;
    expiryTimestamp: number;
    remainingDays: number;
    paidAmount: number;
    latestPaymentStatus: Payment["status"] | null;
    latestPaymentMethod: Payment["method"] | null;
    latestPaymentReference: string | null;
    latestPaymentSubmittedAt: string | null;
    payments: Array<{
      paymentId: string;
      amount: number;
      method: Payment["method"];
      transactionRef: string;
      status: Payment["status"];
      submittedAt: string;
    }>;
  };
  mt5: {
    isConnected: boolean;
    loginId: string;
    password: string;
    brokerServer: string;
    connectedAt: string | null;
  };
  bots: Record<string, Bot>;
}

function sortPayments(payments: Payment[] = []) {
  return [...payments].sort(
    (left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime()
  );
}

function getDisplayAccountStatus(user: UserDocument, now = Date.now()) {
  const expiryTimestamp = new Date(user.subscription.expiryDate).getTime();

  if (user.subscription.approvalStatus === "pending") {
    return "Pending Approval";
  }

  if (user.subscription.approvalStatus === "rejected") {
    return "Rejected";
  }

  if (user.subscription.status === "active" && expiryTimestamp > now) {
    return "Active";
  }

  if (user.subscription.status === "expired" || expiryTimestamp <= now) {
    return "Expired";
  }

  return "Inactive";
}

function getPaymentMeta(user: UserDocument) {
  const orderedPayments = sortPayments(user.subscription.payments || []);
  const latestPayment = orderedPayments[0] || null;
  const latestConfirmedPayment = orderedPayments.find((payment) => payment.status === "confirmed") || null;

  return {
    orderedPayments,
    latestPayment,
    latestConfirmedPayment,
  };
}

export function buildAdminUserSummary(user: UserDocument, now = Date.now()): AdminUserSummary {
  const expiryTimestamp = new Date(user.subscription.expiryDate).getTime();
  const { latestPayment, latestConfirmedPayment } = getPaymentMeta(user);

  return {
    id: user.userId,
    email: user.account.email,
    fullName: user.account.username,
    accountStatus: getDisplayAccountStatus(user, now),
    subscriptionStatus: user.subscription.status,
    approvalStatus: user.subscription.approvalStatus,
    subscriptionExpiresAt: expiryTimestamp,
    createdAt: new Date(user.account.createdAt).getTime(),
    mt5Connected: user.mt5?.isConnected ?? false,
    daysRemaining: Math.max(0, Math.ceil((expiryTimestamp - now) / (24 * 60 * 60 * 1000))),
    paidAmount: latestConfirmedPayment?.amount ?? user.subscription.priceUSD ?? 0,
    latestPaymentStatus: latestPayment?.status ?? null,
    latestPaymentMethod: latestPayment?.method ?? null,
    latestPaymentSubmittedAt: latestPayment?.submittedAt ?? null,
  };
}

export async function buildAdminUserDetails(userId: string, now = Date.now()): Promise<AdminUserDetails | null> {
  const user = await getUser(userId);

  if (!user) {
    return null;
  }

  const summary = buildAdminUserSummary(user, now);
  const { orderedPayments, latestPayment, latestConfirmedPayment } = getPaymentMeta(user);
  const bots = await getAllUserBotSettings(user.userId);

  return {
    ...summary,
    userId: user.userId,
    subscription: {
      status: user.subscription.status,
      approvalStatus: user.subscription.approvalStatus,
      displayStatus: summary.accountStatus,
      planName: user.subscription.planName,
      billingCycle: user.subscription.billingCycle,
      expiryDate: user.subscription.expiryDate,
      expiryTimestamp: summary.subscriptionExpiresAt,
      remainingDays: summary.daysRemaining,
      paidAmount: latestConfirmedPayment?.amount ?? user.subscription.priceUSD ?? 0,
      latestPaymentStatus: latestPayment?.status ?? null,
      latestPaymentMethod: latestPayment?.method ?? null,
      latestPaymentReference: latestPayment?.transactionRef ?? null,
      latestPaymentSubmittedAt: latestPayment?.submittedAt ?? null,
      payments: orderedPayments.map((payment) => ({
        paymentId: payment.paymentId,
        amount: payment.amount,
        method: payment.method,
        transactionRef: payment.transactionRef,
        status: payment.status,
        submittedAt: payment.submittedAt,
      })),
    },
    mt5: {
      isConnected: user.mt5?.isConnected ?? false,
      loginId: user.mt5?.loginId ?? "",
      password: user.mt5?.password ?? "",
      brokerServer: user.mt5?.brokerServer ?? "",
      connectedAt: user.mt5?.connectedAt ?? null,
    },
    bots: Object.fromEntries(Object.entries(bots)) as Record<string, Bot>,
  };
}
