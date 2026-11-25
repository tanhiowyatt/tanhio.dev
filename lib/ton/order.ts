/* Order management for TON sponsor payments.

Generates unique order IDs and builds the `PAY:<orderId>` comment that users
include in their TON transfer. Orders are not persisted server-side — the
comment itself is the unique lookup key, verified against the TON blockchain.
*/

import { randomBytes } from "crypto";

/** Generates a unique order id: timestamp + random hex. */
export function createOrderId(): string {
  const ts = Date.now().toString(36);
  const rand = randomBytes(4).toString("hex");
  return `ton_${ts}_${rand}`;
}

/** Builds the comment string embedded in the TON transfer. */
export function buildComment(orderId: string): string {
  return `PAY:${orderId}`;
}

/** The TON amount for a sponsor seat, in nano-TON (5 TON). */
export const TON_AMOUNT_NANO = "100000000";
