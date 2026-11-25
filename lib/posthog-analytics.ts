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
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/+$/, "");
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

export function posthogAnalyticsConfigured(): boolean {
  return Boolean(API_KEY && HOST && PROJECT_ID);
}

interface PostHogQueryResponse {
  results?: Array<Array<unknown>>;
  error?: string;
}

async function posthogQuery(query: string): Promise<Array<Array<unknown>> | null> {
  if (!API_KEY || !HOST || !PROJECT_ID) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[PostHog] Missing credentials",
        { hasKey: Boolean(API_KEY), hasHost: Boolean(HOST) }
      );
    }
    return null;
  }
  try {
    const res = await fetch(`${HOST}/api/projects/${PROJECT_ID}/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          kind: "HogQLQuery",
          query,
        },
      }),
      cache: "no-store",
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        const text = await res.text();
        console.warn("[PostHog] Query API error", res.status, text);
      }
      return null;
    }
    const json = (await res.json()) as PostHogQueryResponse;
    if (json.error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[PostHog] Query API returned error", json.error);
      }
      return null;
    }
    if (!json.results) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[PostHog] Query API returned no results", JSON.stringify(json).slice(0, 500));
      }
      return null;
    }
    return json.results;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[PostHog] Query request failed", err);
    }
    return null;
  }
}

export interface PostHogTrafficPoint {
  date: string;
  visitors: number;
  sessions: number;
  pageviews: number;
}

export async function getDailyPageViews(days: number): Promise<PostHogTrafficPoint[]> {
  const results = await posthogQuery(`
    SELECT
      toStartOfDay(timestamp) as day,
      uniq(distinct_id) as visitors,
      uniq($session_id) as sessions,
      count() as pageviews
    FROM events
    WHERE event = '$pageview'
      AND timestamp >= now() - interval ${days} day
    GROUP BY day
    ORDER BY day
  `);
  if (!results) return [];
  return results
    .map((row) => ({
      date: String(row[0] ?? "").slice(0, 10),
      visitors: typeof row[1] === "number" ? row[1] : 0,
      sessions: typeof row[2] === "number" ? row[2] : 0,
      pageviews: typeof row[3] === "number" ? row[3] : 0,
    }))
    .filter((p) => p.date && p.pageviews > 0);
}

/** Fetches daily aggregated traffic for an explicit [start, end) window. */
export async function getDailyPageViewsRange(
  start: string,
  end: string,
): Promise<PostHogTrafficPoint[]> {
  const results = await posthogQuery(`
    SELECT
      toStartOfDay(timestamp) as day,
      uniq(distinct_id) as visitors,
      uniq($session_id) as sessions,
      count() as pageviews
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
      date: String(row[0] ?? "").slice(0, 10),
      visitors: typeof row[1] === "number" ? row[1] : 0,
      sessions: typeof row[2] === "number" ? row[2] : 0,
      pageviews: typeof row[3] === "number" ? row[3] : 0,
    }))
    .filter((p) => p.date && p.pageviews > 0);
}

export async function getTotalPageViews(): Promise<number | null> {
  const results = await posthogQuery(
    "SELECT count() FROM events WHERE event = '$pageview'",
  );
  const value = results?.[0]?.[0];
  return typeof value === "number" ? value : null;
}

/** Average session duration in seconds over the last `days` days.
 *  Computed from the events table by measuring the time span of each
 *  session (first to last event) and averaging across sessions. */
export async function getAverageEngagedSeconds(
  days: number,
): Promise<number | null> {
  const results = await posthogQuery(`
    SELECT avg(session_duration) as avg_duration
    FROM (
      SELECT max(timestamp) - min(timestamp) as session_duration
      FROM events
      WHERE timestamp >= now() - interval ${days} day
      GROUP BY $session_id
    )
  `);
  if (!results) return null;
  const value = results[0]?.[0];
  return typeof value === "number" ? value : null;
}
