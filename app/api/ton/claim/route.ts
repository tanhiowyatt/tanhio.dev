/* Claim backend for TON sponsor payments.

Verifies that a 5 TON payment with comment `PAY:<orderId>` has arrived at the
owner wallet (via TON Center API), then commits the sponsor seat to
`config/sponsors.generated.json` via the GitHub Contents API. Logo images are
committed to `public/sponsors/`.

Re-verifies the payment on the server rather than trusting the frontend. */

import { NextResponse } from "next/server";

import { verifyTonPayment } from "@/lib/ton/verify";
import {
  commitLogo,
  commitSponsor,
  commitSponsorClaim,
  type ClaimPatch,
} from "@/lib/sponsor-store";

export const dynamic = "force-dynamic";

const MAX_LOGO_BYTES = 512 * 1024;
const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return error("Invalid form submission.", 400);
  }

  const orderId = String(form.get("orderId") ?? "").trim();
  const senderAddress = String(form.get("senderAddress") ?? "").trim();
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const rawUrl = String(form.get("url") ?? "").trim().slice(0, 300);
  const logo = form.get("logo");

  if (!orderId) {
    return error("A payment order id is required.", 400);
  }

  let url: string | undefined;
  if (rawUrl) {
    let parsed: URL;
    try {
      parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    } catch {
      return error("The URL must start with http:// or https://.", 401);
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return error("The URL must start with http:// or https://.", 401);
    }
    url = parsed.toString();
  }

  if (logo !== null && !(logo instanceof File)) {
    return error("Invalid logo upload.", 400);
  }
  if (logo instanceof File && logo.size > 0) {
    if (!ACCEPTED_LOGO_TYPES.includes(logo.type)) {
      return error("Logos must be PNG, JPEG or WebP.", 415);
    }
    if (logo.size > MAX_LOGO_BYTES) {
      return error("Logos must be 512KB or smaller.", 413);
    }
  }

  // Re-verify the payment on the blockchain before committing anything.
  const payment = await verifyTonPayment(orderId, senderAddress);
  if (!payment.paid) {
    return error(
      "This payment has not been confirmed on the TON network yet. Try again in a moment.",
      409,
    );
  }

  // Commit the sponsor entry. Use tonTxHash as the dedup key.
  const tonTxHash = payment.txHash ?? orderId;
  const date = payment.paidAt ? payment.paidAt.slice(0, 10) : new Date().toISOString().slice(0, 10);

  const created = await commitSponsor({
    paymentId: tonTxHash,
    name: name || "Sponsor",
    date,
  });

  if (!created) {
    return error("This seat has already been claimed.", 409);
  }
  if (created === "duplicate") {
    return error("This seat has already been claimed.", 409);
  }

  // Apply claim fields (name, url, logo) and mark as claimed.
  const patch: ClaimPatch = {};
  if (name) patch.name = name;
  if (url) patch.url = url;

  if (logo instanceof File && logo.size > 0) {
    const bytes = Buffer.from(await logo.arrayBuffer());
    const logoPath = await commitLogo(tonTxHash, bytes, logo.type);
    if (!logoPath) {
      return error("The logo could not be saved. Try again.", 502);
    }
    patch.logo = logoPath;
  }

  const claimed = await commitSponsorClaim(tonTxHash, patch);
  switch (claimed) {
    case "committed":
      return NextResponse.json({ ok: true }, { status: 200 });
    case "not-found":
      return error("The seat could not be found. Try again.", 409);
    case "already-claimed":
      return error("This seat has already been claimed.", 409);
    default:
      return error("The claim could not be saved. Try again.", 502);
  }
}
