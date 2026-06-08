import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAuth } from "@/lib/server/auth";
import { createPayment, getCoupon, updateCoupon } from "@/lib/server/db";
import {
  isValidTransactionId,
  sanitizeInput,
} from "@/lib/server/validation";

const BASE_AMOUNT = 50; // $50

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { transactionId, method, couponCode } = body;

    // Validate inputs
    if (!transactionId || !method) {
      return NextResponse.json(
        { error: "Transaction ID and method are required" },
        { status: 400 }
      );
    }

    if (!isValidTransactionId(transactionId)) {
      return NextResponse.json(
        { error: "Invalid transaction ID format" },
        { status: 400 }
      );
    }

    if (!["USDT-TRC20", "MTN-MoMo", "Airtel"].includes(method)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // Check coupon if provided
    let finalAmount = BASE_AMOUNT;
    let discountPercent = 0;

    if (couponCode) {
      let coupon;
      try {
        coupon = await getCoupon(couponCode);
      } catch (error) {
        console.error("Coupon lookup error:", error);
        return NextResponse.json(
          { error: "Payment service unavailable" },
          { status: 503 }
        );
      }
      if (!coupon || Object.keys(coupon).length === 0) {
        return NextResponse.json(
          { error: "Invalid coupon code" },
          { status: 400 }
        );
      }

      // Check coupon validity
      if (
        (coupon as any).isActive !== true &&
        (coupon as any).isActive !== "true" &&
        parseInt((coupon as any).currentUses as any, 10) >= parseInt((coupon as any).maxUses as any, 10)
      ) {
        return NextResponse.json(
          { error: "Coupon expired or limit reached" },
          { status: 400 }
        );
      }

      if ((coupon as any).expiresAt < Date.now()) {
        return NextResponse.json(
          { error: "Coupon expired" },
          { status: 400 }
        );
      }

      discountPercent = parseInt((coupon as any).discountPercent as any, 10);
      finalAmount = BASE_AMOUNT - (BASE_AMOUNT * discountPercent) / 100;

      // Update coupon usage
      await updateCoupon(couponCode, {
        currentUses: (parseInt((coupon as any).currentUses as any, 10) || 0) + 1,
      });
    }

    // Create payment record
    const paymentId = randomUUID();
    const now = Date.now();

    await createPayment(paymentId, {
      userId: session.userId,
      method: sanitizeInput(method),
      transactionId: sanitizeInput(transactionId),
      amount: finalAmount,
      status: "Pending",
      createdAt: now,
      couponCode: couponCode || undefined,
      originalAmount: couponCode ? BASE_AMOUNT : undefined,
    });

    return NextResponse.json(
      {
        message: "Payment submitted successfully",
        paymentId,
        amount: finalAmount,
        originalAmount: couponCode ? BASE_AMOUNT : undefined,
        discountPercent,
        status: "Pending",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Payment submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
