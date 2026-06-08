import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getPayment, updatePayment, updateUser, getUser } from "@/lib/server/db";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Get payment
    let payment;
    try {
      payment = await getPayment(paymentId);
    } catch (error) {
      console.error("Approve payment lookup error:", error);
      return NextResponse.json(
        { error: "Payment service unavailable" },
        { status: 503 }
      );
    }

    if (!payment || Object.keys(payment).length === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Safely cast to Record to avoid TypeScript inference errors
    const p = payment as Record<string, any>;
    
    if (p.status !== "Pending") {
      return NextResponse.json(
        { error: "Payment is not pending" },
        { status: 400 }
      );
    }

    // Approve payment
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    await updatePayment(paymentId, {
      status: "Approved",
      approvedAt: now,
    });

    // Update user subscription
    const userId = p.userId as string;
    const userData = await getUser(userId);
    
    // Safely cast userData to access dynamic properties without TS errors
    const ud = userData as Record<string, any> | null;
    
    // Safely parse the current expiry, falling back to 'now' if invalid or missing
    let currentExpiry = now;
    if (ud && ud.subscriptionExpiresAt) {
      const parsed = parseInt(ud.subscriptionExpiresAt.toString(), 10);
      if (!isNaN(parsed)) {
        currentExpiry = parsed;
      }
    }

    const newExpiry = Math.max(currentExpiry, now) + thirtyDaysMs;

    await updateUser(userId, {
      accountStatus: "Active",
      subscriptionExpiresAt: newExpiry,
    });

    return NextResponse.json(
      {
        message: "Payment approved successfully",
        paymentId,
        newExpiryDate: newExpiry,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment approve error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}