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
    const payment = await getPayment(paymentId);
    if (!payment || Object.keys(payment).length === 0) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    if (payment.status !== "Pending") {
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
    const userData = await getUser(payment.userId as string);
    const currentExpiry = parseInt(
      (userData?.subscriptionExpiresAt as any) || now,
      10
    );
    const newExpiry = Math.max(currentExpiry, now) + thirtyDaysMs;

    await updateUser(payment.userId as string, {
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
