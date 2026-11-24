/* TON Center API verification for sponsor payments.

Polls the TON Center `getTransactions` endpoint for the owner wallet address
and checks each inbound transaction against an order's `PAY:<orderId>` comment,
the exact 5 TON amount, and a successful execution status. No frontend data
is trusted — every check is done against the blockchain directly. */

import "server-only";

import { Address, Cell, beginCell, toNano } from "@ton/core";

const TON_AMOUNT_NANO = toNano(5);
const OWNER_DOMAIN = "tanhiowyatt.ton";

const API_URL = process.env.TON_CENTER_API_URL ?? "https://toncenter.com/api/v3";
const API_KEY = process.env.TON_CENTER_API_KEY;
const OWNER_ADDRESS_RAW = process.env.TON_OWNER_ADDRESS;

/** Resolves the owner address: env var first, then TON Center DNS, else the domain string. */
async function resolveOwnerAddress(): Promise<string> {
  if (OWNER_ADDRESS_RAW) {
    try {
      return Address.parse(OWNER_ADDRESS_RAW).toString();
    } catch {
      // fall through to DNS resolution
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(
      `${API_URL}/dns?domain=${encodeURIComponent(OWNER_DOMAIN)}`,
      { signal: controller.signal },
    ).finally(() => clearTimeout(timeout));

    if (response.ok) {
      const data = (await response.json()) as { address?: string };
      if (data?.address) return Address.parse(data.address).toString();
    }
  } catch {
    // fall through
  }

  return OWNER_DOMAIN;
}

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
}

/** Resolves a TON address: parse first, then TON Center DNS, else raw string. */
async function resolveAddress(raw: string): Promise<string> {
  try {
    return Address.parse(raw).toString();
  } catch {
    // fall through to DNS resolution
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(
      `${API_URL}/dns?domain=${encodeURIComponent(raw)}`,
      { signal: controller.signal },
    ).finally(() => clearTimeout(timeout));

    if (response.ok) {
      const data = (await response.json()) as { address?: string };
      if (data?.address) return Address.parse(data.address).toString();
    }
  } catch {
    // fall through
  }

  return raw;
}

/**
 * Checks whether a 5 TON payment with comment `PAY:<orderId>` has arrived at
 * the owner wallet. Polls the last 100 transactions with `archival=true`.
 * When `senderAddress` is given, the transaction source must match it too.
 */
export async function verifyTonPayment(
  orderId: string,
  senderAddress?: string,
): Promise<TonPaymentResult> {
  const ownerAddress = await resolveOwnerAddress();
  const resolvedSender = senderAddress ? await resolveAddress(senderAddress) : undefined;
  const expectedComment = `PAY:${orderId}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const url = `${API_URL}/getTransactions?address=${encodeURIComponent(
      ownerAddress,
    )}&limit=100&archival=true`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: API_KEY ? { "X-API-Key": API_KEY } : {},
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return { paid: false, orderId };
    }

    const data = (await response.json()) as {
      transactions?: Array<{
        transaction_id?: { hash?: string; lt?: string };
        in_msg?: {
          source?: string;
          destination?: string;
          value?: string;
          body?: string;
        };
        utime?: number;
        exit_code?: number;
        aborted?: boolean;
      }>;
    };

    const txs = data.transactions ?? [];

    for (const tx of txs) {
      // Must be a successful, non-aborted inbound transaction.
      if (tx.exit_code !== 0 || tx.aborted === true) continue;
      if (!tx.in_msg) continue;

      // Destination must be the owner wallet.
      const destination = tx.in_msg.destination;
      if (!destination) continue;
      try {
        if (Address.parse(destination).toString() !== ownerAddress) continue;
      } catch {
        continue;
      }

      // Source must match the sender address, if one was provided.
      if (resolvedSender) {
        const source = tx.in_msg.source;
        if (!source) continue;
        try {
          if (Address.parse(source).toString() !== resolvedSender) continue;
        } catch {
          continue;
        }
      }

      // Amount must be exactly 5 TON.
      const value = tx.in_msg.value;
      if (!value || BigInt(value) !== TON_AMOUNT_NANO) continue;

      // Comment must match PAY:<orderId>.
      const comment = decodeComment(tx.in_msg.body);
      if (comment !== expectedComment) continue;

      return {
        paid: true,
        orderId,
        txHash: tx.transaction_id?.hash,
        lt: tx.transaction_id?.lt,
        paidAt: tx.utime
          ? new Date(tx.utime * 1000).toISOString()
          : undefined,
        amountNano: value,
      };
    }

    return { paid: false, orderId };
  } catch {
    return { paid: false, orderId };
  }
}

/** Encodes a comment for use in a TON Connect sendTransaction body. */
export function buildPaymentComment(orderId: string): string {
  return encodeComment(`PAY:${orderId}`);
}
