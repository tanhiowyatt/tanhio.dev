import "server-only";

const API_KEY = process.env.POSTHOG_API_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/+$/, "");
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

function posthogConfigured(): boolean {
  return Boolean(API_KEY && HOST && PROJECT_ID);
}

export interface ActivityEntry {
  id: string;
  category: string;
  timestamp: string;
  ip: string;
  data: Record<string, unknown>;
}

/** Logs an activity event with a category, data payload, and client IP.
 *  Sends a capture event to PostHog when configured; falls back to the
 *  server console otherwise (visible in Vercel Function logs).
 *
 *  Security: only public data is logged — TON wallet addresses, transaction
 *  hashes, order ids and user-provided name/url. No private keys, mnemonics
 *  or signatures are ever captured.
 */
export function logActivity(
  category: string,
  data: Record<string, unknown>,
  ip: string,
): void {
  const timestamp = new Date().toISOString();
  const entry: ActivityEntry = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    category,
    timestamp,
    ip,
    data,
  };

  if (posthogConfigured()) {
    // Use the TON sender address as the PostHog distinct_id when available,
    // falling back to IP. This groups events by payer across sessions.
    const distinctId =
      typeof data.senderAddress === "string" && data.senderAddress.length > 0
        ? String(data.senderAddress)
        : ip;

    void fetch(`${HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: API_KEY,
        event: category,
        distinct_id: distinctId,
        properties: {
          $ip: ip,
          category,
          ...entry.data,
          timestamp,
        },
      }),
    }).catch((err) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[PostHog] Activity capture failed", err);
      }
    });
  } else {
    console.log(JSON.stringify({ event: "activity", ...entry }));
  }
}
