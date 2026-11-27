/* TON Center API verification for sponsor payments.

Polls the TON Center `transactions` endpoint for the owner wallet address
and checks each inbound transaction against an order's `PAY:<orderId>` comment,
the exact order amount, and a successful execution status. No frontend data
is trusted — every check is done against the blockchain directly. */

import "server-only";

import { Address, Cell, beginCell } from "@ton/core";

import { TON_AMOUNT_NANO } from "@/lib/ton/order";

const API_URL = process.env.TON_CENTER_API_URL ?? "https://toncenter.com/api/v3";
const API_KEY = process.env.TON_CENTER_API_KEY;
const OWNER_ADDRESS_RAW = process.env.TON_OWNER_ADDRESS;

/** Encodes a TON comment message body: 32 zero bits + UTF-8 string, base64 Boc. */
function encodeComment(comment: string): string {
  const cell = beginCell()
    .storeUint(0, 32)
    .storeBuffer(Buffer.from(comment, "utf-8"))
    .endCell();
  return cell.toBoc().toString("base64");
}

/** Decodes a TON transaction's inbound message body to a comment string, if present. */
function decodeComment(bodyBocBase64: string | undefined): string | null {
  if (!bodyBocBase64) return null;
  try {
    const cell = Cell.fromBoc(Buffer.from(bodyBocBase64, "base64"))[0];
    const parser = cell.beginParse();
    const op = parser.loadUint(32);
    if (op !== 0) return null;
    return parser.loadStringTail();
  } catch {
    return null;
  }
}

export interface TonPaymentResult {
  paid: boolean;
  orderId: string;
  txHash?: string;
  lt?: string;
  paidAt?: string;
  amountNano?: string;
  error?: string;
}

/** Parses the owner address from TON_OWNER_ADDRESS (EQ…/UQ… user-friendly format). */
function ownerAddress(): Address | null {
  if (!OWNER_ADDRESS_RAW) return null;
  try {
    return Address.parse(OWNER_ADDRESS_RAW);
  } catch {
    return null;
  }
}

/**
 * Checks whether a payment with comment `PAY:<orderId>` has arrived at
 * the owner wallet. Polls the last 100 transactions for the owner address.
 * When `senderAddress` is given, the transaction source must match it too.
 */
export async function verifyTonPayment(
  orderId: string,
  senderAddress?: string,
): Promise<TonPaymentResult> {
  const owner = ownerAddress();
  const expectedComment = `PAY:${orderId}`;
  const resolvedSender = senderAddress
    ? (() => {
        try {
          return Address.parse(senderAddress);
        } catch {
          return undefined;
        }
      })()
    : undefined;

  if (!owner) {
    return { paid: false, orderId };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const url = `${API_URL}/transactions?account=${encodeURIComponent(
      owner.toString(),
    )}&limit=100`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: API_KEY ? { "X-API-Key": API_KEY } : {},
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return { paid: false, orderId, error: 'api_error' };
    }

    const data = (await response.json()) as {
      transactions?: Array<{
        hash?: string;
        lt?: string;
        now?: number;
        description?: {
          compute_ph?: {
            exit_code?: number;
          };
          aborted?: boolean;
        };
        in_msg?: {
          source?: string;
          destination?: string;
          value?: string;
          message_content?: {
            body?: string;
          };
        };
      }>;
    };

    const txs = data.transactions ?? [];

    for (const tx of txs) {
      // Must be a successful, non-aborted inbound transaction.
      const exitCode = tx.description?.compute_ph?.exit_code;
      const aborted = tx.description?.aborted;
      if (exitCode !== 0 || aborted === true) {
        continue;
      }
      if (!tx.in_msg) {
        continue;
      }

      // Destination must be the owner wallet. Compare by raw hash so UQ/EQ
      // user-friendly formats of the same address match.
      const destination = tx.in_msg.destination;
      if (!destination) {
        continue;
      }
      let destAddress: Address;
      try {
        destAddress = Address.parse(destination);
      } catch {
        continue;
      }
      const destRaw = destAddress.toRawString();
      const ownerRaw = owner.toRawString();
      if (destRaw !== ownerRaw) {
        continue;
      }

      // Source must match the sender address, if one was provided.
      if (resolvedSender) {
        const source = tx.in_msg.source;
        if (!source) {
          continue;
        }
        let srcAddress: Address;
        try {
          srcAddress = Address.parse(source);
        } catch {
          continue;
        }
        if (srcAddress.toRawString() !== resolvedSender.toRawString()) {
          continue;
        }
      }

      // Amount must match the order amount exactly.
      const value = tx.in_msg.value;
      if (!value || BigInt(value) !== BigInt(TON_AMOUNT_NANO)) {
        continue;
      }

      // Comment must match PAY:<orderId>.
      const comment = decodeComment(tx.in_msg.message_content?.body);
      if (comment !== expectedComment) {
        continue;
      }

      return {
        paid: true,
        orderId,
        txHash: tx.hash,
        lt: tx.lt,
        paidAt: tx.now
          ? new Date(tx.now * 1000).toISOString()
          : undefined,
        amountNano: value,
      };
    }

    return { paid: false, orderId };
  } catch {
    return { paid: false, orderId, error: 'api_error' };
  }
}

/** Encodes a comment for use in a TON Connect sendTransaction body. */
export function buildPaymentComment(orderId: string): string {
  return encodeComment(`PAY:${orderId}`);
}
