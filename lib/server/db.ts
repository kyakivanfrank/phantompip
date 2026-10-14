import { executeRead, executeWrite } from "./supabase";
import { normalizeEmail } from "./validation";
import { UserDocument, UserIndexEntry, Payment } from "@/lib/types";

export async function mapWithConcurrency<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency = 10
): Promise<R[]> {
  if (!items.length) return [];

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const currentIndex = nextIndex++;
      if (currentIndex >= items.length) return;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(workers);
  return results;
}

export async function attempt<T>(
  fn: () => Promise<T>,
  timeoutMs = 5000,
  retries = 2
): Promise<T> {
  let lastErr: any;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Database operation timed out")), timeoutMs)
        ),
      ]);
      return res as T;
    } catch (err) {
      lastErr = err;
      const backoff = 100 * Math.pow(2, i);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr;
}

// -----------------------------------------------------------------------------
// USER OPERATIONS
// -----------------------------------------------------------------------------

export async function createUser(userId: string, userData: UserDocument): Promise<UserDocument> {
  const normalizedEmail = normalizeEmail(userData.account.email);
  const nowIso = new Date().toISOString();

  const userPayload = {
    id: userId,
    email: normalizedEmail,
    username: userData.account.username,
    password_hash: userData.account.passwordHash,
    is_admin: Boolean(userData.isAdmin),
    profile_picture: userData.account.profilePicture || null,
    created_at: userData.account.createdAt || nowIso,
    last_login_at: userData.account.lastLoginAt || nowIso,
  };

  const sub = userData.subscription || ({} as any);
  const subscriptionPayload = {
    status: sub.status || "inactive",
    approval_status: sub.approvalStatus || "none",
    plan_name: sub.planName || "No Plan",
    price_usd: sub.priceUSD || 0,
    billing_cycle: sub.billingCycle || "monthly",
    start_date: sub.startDate ? sub.startDate.slice(0, 10) : null,
    expiry_date: sub.expiryDate ? sub.expiryDate.slice(0, 10) : null,
    approved_at: sub.approvedAt || null,
  };

  const mt5 = userData.mt5 || {
    loginId: "",
    password: "",
    brokerServer: "",
    connectedAt: null,
    isConnected: false,
    isBotRunning: false,
  };

  const mt5Payload = {
    login_id: mt5.loginId || "",
    password: mt5.password || "",
    broker_server: mt5.brokerServer || "",
    connected_at: mt5.connectedAt || null,
    is_connected: Boolean(mt5.isConnected),
    is_bot_running: Boolean(mt5.isBotRunning),
  };

  return await executeWrite("createUser", async (supabase) => {
    const { error } = await supabase.rpc("app_create_user", {
      p_user: userPayload,
      p_subscription: subscriptionPayload,
      p_mt5: mt5Payload,
    });

    if (error) {
      throw new Error(`Failed to create user in database: ${error.message}`);
    }

    return userData;
  });
}

export async function getUser(userId: string): Promise<UserDocument | null> {
  return await executeRead("getUser", async (supabase) => {
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        username,
        password_hash,
        is_admin,
        profile_picture,
        created_at,
        last_login_at,
        subscriptions (
          status,
          approval_status,
          plan_name,
          price_usd,
          billing_cycle,
          start_date,
          expiry_date,
          approved_at
        ),
        mt5_accounts (
          login_id,
          password,
          broker_server,
          connected_at,
          is_connected,
          is_bot_running
        ),
        payments (
          id,
          amount,
          method,
          network,
          transaction_ref,
          status,
          submitted_at
        )
      `)
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      throw new Error(`Failed to fetch user ${userId}: ${userError.message}`);
    }

    if (!user) {
      return null;
    }

    const sub = Array.isArray(user.subscriptions)
      ? user.subscriptions[0]
      : user.subscriptions;

    const mt5 = Array.isArray(user.mt5_accounts)
      ? user.mt5_accounts[0]
      : user.mt5_accounts;

    const paymentsList = (user.payments || []) as any[];
    const sortedPayments: Payment[] = paymentsList
      .map((p) => ({
        paymentId: p.id,
        amount: Number(p.amount),
        method: p.method,
        network: p.network,
        transactionRef: p.transaction_ref,
        status: p.status,
        submittedAt: p.submitted_at,
      }))
      .sort(
        (a, b) =>
          new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
      );

    const userDoc: UserDocument = {
      userId: user.id,
      isAdmin: user.is_admin,
      account: {
        username: user.username,
        email: user.email,
        passwordHash: user.password_hash,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at || user.created_at,
        profilePicture:
          user.profile_picture !== null ? user.profile_picture : undefined,
      },
      subscription: {
        status: sub?.status || "inactive",
        approvalStatus: sub?.approval_status || "none",
        planName: sub?.plan_name || "No Plan",
        priceUSD: Number(sub?.price_usd ?? 0),
        billingCycle: sub?.billing_cycle || "monthly",
        startDate: sub?.start_date ? String(sub.start_date) : "",
        expiryDate: sub?.expiry_date ? String(sub.expiry_date) : "",
        approvedAt: sub?.approved_at || null,
        payments: sortedPayments,
      },
      mt5: mt5
        ? {
            loginId: mt5.login_id || "",
            password: mt5.password || "",
            brokerServer: mt5.broker_server || "",
            connectedAt: mt5.connected_at || null,
            isConnected: Boolean(mt5.is_connected),
            isBotRunning: Boolean(mt5.is_bot_running),
          }
        : {
            loginId: "",
            password: "",
            brokerServer: "",
            connectedAt: null,
            isConnected: false,
            isBotRunning: false,
          },
    };

    return userDoc;
  });
}

export async function getUserIdByEmail(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);

  return await executeRead("getUserIdByEmail", async (supabase) => {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalized)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to lookup user by email: ${error.message}`);
    }

    return data?.id || null;
  });
}

export async function getUserByEmail(email: string): Promise<UserDocument | null> {
  const userId = await getUserIdByEmail(email);
  if (!userId) return null;
  return await getUser(userId);
}

export async function setUserByEmail(_email: string, _userId: string): Promise<void> {
  // Maintained for backward compatibility. In Supabase Postgres, email is a unique column on users.
  return;
}

export async function deleteUser(userId: string): Promise<void> {
  await executeWrite("deleteUser", async (supabase) => {
    // Deleting user row cascades to subscriptions, payments, and mt5_accounts automatically
    const { error } = await supabase.from("users").delete().eq("id", userId);
    if (error) {
      throw new Error(`Failed to delete user ${userId}: ${error.message}`);
    }
  });
}

export async function getAllUsers(): Promise<UserIndexEntry[]> {
  return await executeRead("getAllUsers", async (supabase) => {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        username,
        email,
        is_admin,
        subscriptions (
          status,
          approval_status,
          expiry_date
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get all users: ${error.message}`);
    }

    return (data || []).map((row: any) => {
      const sub = Array.isArray(row.subscriptions)
        ? row.subscriptions[0]
        : row.subscriptions;

      return {
        userId: row.id,
        username: row.username,
        email: row.email,
        subscriptionStatus: sub?.status || "inactive",
        approvalStatus: sub?.approval_status || "none",
        expiryDate: sub?.expiry_date ? String(sub.expiry_date) : "",
        isAdmin: row.is_admin,
      };
    });
  });
}

export async function updateUserDetails(
  userId: string,
  updates: { username?: string; email?: string }
): Promise<void> {
  const payload: Record<string, any> = {};

  if (updates.username) payload.username = updates.username;
  if (updates.email) payload.email = normalizeEmail(updates.email);

  if (Object.keys(payload).length === 0) return;

  await executeWrite("updateUserDetails", async (supabase) => {
    const { error } = await supabase.from("users").update(payload).eq("id", userId);
    if (error) {
      throw new Error(`Failed to update user details: ${error.message}`);
    }
  });
}

export async function updateUserProfilePicture(
  userId: string,
  profilePicture: number
): Promise<void> {
  await executeWrite("updateUserProfilePicture", async (supabase) => {
    const { error } = await supabase
      .from("users")
      .update({ profile_picture: profilePicture })
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to update profile picture: ${error.message}`);
    }
  });
}

export async function resetUserPassword(
  userId: string,
  newPasswordHash: string
): Promise<void> {
  await executeWrite("resetUserPassword", async (supabase) => {
    const { error } = await supabase
      .from("users")
      .update({ password_hash: newPasswordHash })
      .eq("id", userId);

    if (error) {
      throw new Error(`Failed to reset password: ${error.message}`);
    }
  });
}

export async function updateSubscription(
  userId: string,
  updates: Partial<UserDocument["subscription"]>
): Promise<void> {
  const payload: Record<string, any> = {};

  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.approvalStatus !== undefined) payload.approval_status = updates.approvalStatus;
  if (updates.planName !== undefined) payload.plan_name = updates.planName;
  if (updates.priceUSD !== undefined) payload.price_usd = updates.priceUSD;
  if (updates.billingCycle !== undefined) payload.billing_cycle = updates.billingCycle;
  if (updates.startDate !== undefined)
    payload.start_date = updates.startDate ? updates.startDate.slice(0, 10) : null;
  if (updates.expiryDate !== undefined)
    payload.expiry_date = updates.expiryDate ? updates.expiryDate.slice(0, 10) : null;
  if (updates.approvedAt !== undefined) payload.approved_at = updates.approvedAt;

  if (Object.keys(payload).length === 0) return;

  await executeWrite("updateSubscription", async (supabase) => {
    const { error } = await supabase
      .from("subscriptions")
      .update(payload)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  });
}

// -----------------------------------------------------------------------------
// PAYMENT OPERATIONS
// -----------------------------------------------------------------------------

export async function createPayment(userId: string, payment: Payment): Promise<any> {
  return await executeWrite("createPayment", async (supabase) => {
    const { data: inserted, error } = await supabase.rpc("app_create_payment", {
      p_payment: {
        id: payment.paymentId,
        user_id: userId,
        amount: payment.amount,
        method: payment.method,
        network: payment.network,
        transaction_ref: payment.transactionRef,
        status: payment.status || "pending",
        submitted_at: payment.submittedAt || new Date().toISOString(),
      },
    });

    if (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }

    if (inserted === false) {
      console.log(`Duplicate payment ${payment.paymentId} prevented for user ${userId}`);
      return "DUPLICATE_PREVENTED";
    }

    return true;
  });
}

export async function getUserPayments(userId: string): Promise<Payment[]> {
  return await executeRead("getUserPayments", async (supabase) => {
    const { data, error } = await supabase
      .from("payments")
      .select("id, amount, method, network, transaction_ref, status, submitted_at")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user payments: ${error.message}`);
    }

    return (data || []).map((p: any) => ({
      paymentId: p.id,
      amount: Number(p.amount),
      method: p.method,
      network: p.network,
      transactionRef: p.transaction_ref,
      status: p.status,
      submittedAt: p.submitted_at,
    }));
  });
}

export async function getAllPayments(): Promise<any[]> {
  return await executeRead("getAllPayments", async (supabase) => {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        id,
        user_id,
        amount,
        method,
        network,
        transaction_ref,
        status,
        submitted_at,
        users (
          email,
          username
        )
      `)
      .order("submitted_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch all payments: ${error.message}`);
    }

    return (data || []).map((p: any) => {
      const user = Array.isArray(p.users) ? p.users[0] : p.users;
      return {
        paymentId: p.id,
        userId: p.user_id,
        amount: Number(p.amount),
        method: p.method,
        network: p.network,
        transactionRef: p.transaction_ref,
        status: p.status,
        submittedAt: p.submitted_at,
        userEmail: user?.email || "",
        username: user?.username || "",
      };
    });
  });
}

export async function getPayment(paymentId: string): Promise<any | null> {
  return await executeRead("getPayment", async (supabase) => {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        id,
        user_id,
        amount,
        method,
        network,
        transaction_ref,
        status,
        submitted_at,
        users (
          email,
          username
        )
      `)
      .eq("id", paymentId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch payment ${paymentId}: ${error.message}`);
    }

    if (!data) return null;

    const user = Array.isArray(data.users) ? data.users[0] : data.users;
    return {
      paymentId: data.id,
      userId: data.user_id,
      amount: Number(data.amount),
      method: data.method,
      network: data.network,
      transactionRef: data.transaction_ref,
      status: data.status,
      submittedAt: data.submitted_at,
      userEmail: user?.email || "",
      username: user?.username || "",
    };
  });
}

export async function updatePaymentStatus(
  userId: string,
  paymentId: string,
  status: string,
  additionalUpdates?: any
): Promise<void> {
  const payload: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "confirmed") {
    payload.confirmed_at = new Date().toISOString();
  } else if (status === "rejected") {
    payload.rejected_at = new Date().toISOString();
  }

  if (additionalUpdates) {
    if (additionalUpdates.transactionRef)
      payload.transaction_ref = additionalUpdates.transactionRef;
    if (additionalUpdates.amount !== undefined)
      payload.amount = additionalUpdates.amount;
    if (additionalUpdates.method) payload.method = additionalUpdates.method;
    if (additionalUpdates.network) payload.network = additionalUpdates.network;
  }

  await executeWrite("updatePaymentStatus", async (supabase) => {
    const { error } = await supabase
      .from("payments")
      .update(payload)
      .eq("id", paymentId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to update payment status: ${error.message}`);
    }
  });
}

export async function updatePayment(paymentId: string, updates: any): Promise<void> {
  const payment = await getPayment(paymentId);
  if (payment) {
    await updatePaymentStatus(
      payment.userId,
      paymentId,
      updates.status || payment.status,
      updates
    );
  }
}

// -----------------------------------------------------------------------------
// MT5 OPERATIONS
// -----------------------------------------------------------------------------

export async function setMt5Credentials(
  userId: string,
  credentials: UserDocument["mt5"]
): Promise<void> {
  const payload = {
    user_id: userId,
    login_id: credentials?.loginId || "",
    password: credentials?.password || "",
    broker_server: credentials?.brokerServer || "",
    connected_at: credentials?.connectedAt || null,
    is_connected: Boolean(credentials?.isConnected),
    is_bot_running: Boolean(credentials?.isBotRunning),
  };

  await executeWrite("setMt5Credentials", async (supabase) => {
    const { error } = await supabase
      .from("mt5_accounts")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      throw new Error(`Failed to set MT5 credentials: ${error.message}`);
    }
  });
}

export async function getMt5Credentials(
  userId: string
): Promise<UserDocument["mt5"] | null> {
  return await executeRead("getMt5Credentials", async (supabase) => {
    const { data, error } = await supabase
      .from("mt5_accounts")
      .select("login_id, password, broker_server, connected_at, is_connected, is_bot_running")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get MT5 credentials: ${error.message}`);
    }

    if (!data) {
      const placeholder = {
        loginId: "",
        password: "",
        brokerServer: "",
        connectedAt: null,
        isConnected: false,
        isBotRunning: false,
      };
      await setMt5Credentials(userId, placeholder);
      return placeholder;
    }

    return {
      loginId: data.login_id || "",
      password: data.password || "",
      brokerServer: data.broker_server || "",
      connectedAt: data.connected_at,
      isConnected: Boolean(data.is_connected),
      isBotRunning: Boolean(data.is_bot_running),
    };
  });
}
