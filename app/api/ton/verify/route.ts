/* Verifies a TON sponsor payment from a specific sender.

Accepts `orderId` and `senderAddress` and checks the TON blockchain for a
5 TON transfer with comment `PAY:<orderId>` from that sender to the owner
wallet. Used by the claim page to confirm payment before showing the claim
form. */

import { NextResponse } from "next/server";

import { verifyTonPayment } from "@/lib/ton/verify";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { orderId?: string; senderAddress?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { orderId, senderAddress } = body;

  if (!orderId) {
    return NextResponse.json({ error: "Missing order id." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const result = await verifyTonPayment(orderId, senderAddress);

  logActivity("ton_payment", {
    payment_status: result.paid ? "confirmed" : "failed",
    orderId,
    senderAddress: senderAddress ?? "",
    ...(result.paid && {
      ton_tx_hash: result.txHash,
      ton_amount_nano: result.amountNano,
      ton_amount_ton: result.amountNano
        ? Number(result.amountNano) / 1_000_000_000
        : 0,
      paidAt: result.paidAt,
    }),
  }, ip);

  return NextResponse.json(result);
}
