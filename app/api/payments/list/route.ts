import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getUserPayments } from "@/lib/server/db";

export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuth();
    let payments;
    try {
      payments = await getUserPayments(session.userId);
    } catch (error) {
      console.error("Payments list DB error:", error);
      return NextResponse.json(
        { error: "Payment service unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        payments: (payments as any[]).map((p) => ({
          id: p.id,
          method: p.method,
          transactionId: p.transactionId,
          amount: p.amount,
          status: p.status,
          createdAt: p.createdAt,
          approvedAt: p.approvedAt,
          couponCode: p.couponCode,
          originalAmount: p.originalAmount,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
