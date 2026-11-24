/*
 * PostHog Analytics data layer.
 *
 * Queries the PostHog Query API for aggregate page view data
 * used by the Insights section.
 *
 * Required secrets (never exposed to the browser):
 *   POSTHOG_API_KEY — PostHog personal API key with read access
 *   NEXT_PUBLIC_POSTHOG_HOST — PostHog instance host (e.g. https://eu.posthog.com)
 */

const API_KEY = process.env.POSTHOG_API_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export function posthogAnalyticsConfigured(): boolean {
  return Boolean(API_KEY && HOST);
}

interface PostHogQueryResponse {
  results?: Array<Array<unknown>>;
  error?: string;
}

async function posthogQuery(query: string): Promise<Array<Array<unknown>> | null> {
  if (!API_KEY || !HOST) return null;
  try {
    const res = await fetch(`${HOST}/api/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          type: "hogql_query",
          query,
          data_table: "events",
        },
      }),
      cache: "force-cache",
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as PostHogQueryResponse;
    return json.results ?? null;
  } catch {
    return null;
  }
}

export interface PostHogTrafficPoint {
  date: string;
  pageViews: number;
}

export async function getDailyPageViews(days: number): Promise<PostHogTrafficPoint[]> {
  const results = await posthogQuery(`
    SELECT
      toStartOfDay(timestamp) as day,
      count() as page_views
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - interval ${days} day
    GROUP BY day
    ORDER BY day
  `);
  if (!results) return [];
  return results
    .map((row) => ({
      date: String(row[0] ?? ""),
      pageViews: typeof row[1] === "number" ? row[1] : 0,
    }))
    .filter((p) => p.date && p.pageViews > 0);
}

/** Fetches daily page views for an explicit [start, end) window. */
export async function getDailyPageViewsRange(
  start: string,
  end: string,
): Promise<{ date: string; pageViews: number }[]> {
  const results = await posthogQuery(`
    SELECT
      toStartOfDay(timestamp) as day,
      count() as page_views
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= '${start}'
      AND timestamp < '${end}'
    GROUP BY day
    ORDER BY day
  `);
  if (!results) return [];
  return results
    .map((row) => ({
      date: String(row[0] ?? ""),
      pageViews: typeof row[1] === "number" ? row[1] : 0,
    }))
    .filter((p) => p.date && p.pageViews > 0);
}

export async function getTotalPageViews(): Promise<number | null> {
  const results = await posthogQuery(
    "SELECT count() FROM events WHERE event = '$pageview'",
  );
  const value = results?.[0]?.[0];
  return typeof value === "number" ? value : null;
}
