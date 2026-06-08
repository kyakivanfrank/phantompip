import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getPayment, updatePayment } from "@/lib/server/db";

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
      console.error("Reject payment lookup error:", error);
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

    if (payment.status !== "Pending") {
      return NextResponse.json(
        { error: "Payment is not pending" },
        { status: 400 }
      );
    }

    // Reject payment
    await updatePayment(paymentId, {
      status: "Rejected",
    });

    return NextResponse.json(
      {
        message: "Payment rejected successfully",
        paymentId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment reject error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
