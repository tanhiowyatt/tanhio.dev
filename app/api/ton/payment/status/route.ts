/* Returns the payment status for a TON sponsor order.

Polls the TON Center `getTransactions` endpoint for the owner wallet and
checks whether a 5 TON transfer with comment `PAY:<orderId>` has arrived.
No frontend data is trusted — every check is done against the blockchain. */

import { NextResponse } from "next/server";

import { verifyTonPayment } from "@/lib/ton/verify";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("id");

  if (!orderId) {
    return NextResponse.json({ error: "Missing order id." }, { status: 400 });
  }

  const result = await verifyTonPayment(orderId);
  return NextResponse.json(result);
}
