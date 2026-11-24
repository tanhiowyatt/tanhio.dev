/* Creates a TON payment order for a sponsor seat.

Generates a unique `orderId`, resolves the owner wallet address, and returns
the payment details the frontend needs to build a TON Connect `sendTransaction`
call. The `comment` (`PAY:<orderId>`) is embedded in the transfer so the
backend can later match the on-chain transaction to this order. */

import { NextResponse } from "next/server";

import { createOrderId, TON_AMOUNT_NANO } from "@/lib/ton/order";
import { buildPaymentComment } from "@/lib/ton/verify";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const orderId = createOrderId();
    const comment = `PAY:${orderId}`;
    const commentEncoded = buildPaymentComment(orderId);

    // Resolve owner address: env var first, then fall back to the .ton domain.
    const ownerAddress = process.env.TON_OWNER_ADDRESS ?? "tanhiowyatt.ton";

    return NextResponse.json({
      orderId,
      address: ownerAddress,
      comment,
      commentEncoded,
      amount: TON_AMOUNT_NANO,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create payment order." },
      { status: 500 },
    );
  }
}
