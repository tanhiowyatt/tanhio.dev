import "server-only";

import { insightsConfig } from "@/config/insights";
import type {
  InsightPoint,
  InsightReport,
  InsightSummary,
} from "@/config/types";
import type { PostHogTrafficPoint } from "@/lib/posthog-analytics";
import {
  getAverageEngagedSeconds,
  getDailyPageViews,
  getDailyPageViewsRange,
} from "@/lib/posthog-analytics";

const DAY_MS = 86_400_000;

/** Enables a test report with zeros instead of real PostHog data. */
function testModeEnabled(): boolean {
  return process.env.INSIGHTS_TEST_MODE === "true";
}

/*
 * Builds an InsightReport from PostHog daily traffic points.
 * Each point aggregates unique visitors (uniq distinct_id), unique sessions
 * (uniq $session_id), and total page views per day. The summary maps each
 * metric to its own total rather than collapsing all three into one number.
 */
function buildPostHogReport(
  points: PostHogTrafficPoint[],
  previous: PostHogTrafficPoint[],
  averageEngagedSeconds: number | null,
): InsightReport {
  const totalVisitors = points.reduce((sum, p) => sum + p.visitors, 0);
  const totalSessions = points.reduce((sum, p) => sum + p.sessions, 0);
  const totalPageviews = points.reduce((sum, p) => sum + p.pageviews, 0);
  const previousTotalVisitors = previous.reduce((sum, p) => sum + p.visitors, 0);
  const previousTotalSessions = previous.reduce((sum, p) => sum + p.sessions, 0);
  const previousTotalPageviews = previous.reduce((sum, p) => sum + p.pageviews, 0);
  const summary: InsightSummary = {
    visitors: totalVisitors,
    sessions: totalSessions,
    pageviews: totalPageviews,
    averageEngagedSeconds,
  };
  const previousSummary: InsightSummary = {
    visitors: previousTotalVisitors,
    sessions: previousTotalSessions,
    pageviews: previousTotalPageviews,
    averageEngagedSeconds: null,
  };
  return {
    points: points.map((p) => ({ date: p.date, visitors: p.visitors })),
    summary,
    previous: previousSummary,
  };
}

function dateRange(days: number): string[] {
  const today = new Date();
  const end = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Array.from({ length: days }, (_, index) =>
    new Date(end - (days - 1 - index) * DAY_MS)
      .toISOString()
      .slice(0, 10),
  );
}

export async function getInsights(): Promise<InsightReport | null> {
  if (testModeEnabled()) {
    return zeroReport();
  }

  if (!process.env.POSTHOG_API_KEY) {
    return null;
  }

  return getPostHogInsights();
}

/** Returns an all-zeros report so the Insights section renders a test display
 *  instead of an unavailable message when traffic data can't be fetched. */
function zeroReport(): InsightReport {
  const days = insightsConfig.days;
  const dates = dateRange(days);
  const points: InsightPoint[] = dates.map((date) => ({ date, visitors: 0 }));
  const empty: InsightSummary = {
    visitors: 0,
    sessions: 0,
    pageviews: 0,
    averageEngagedSeconds: null,
  };
  return { points, summary: empty, previous: { ...empty } };
}

function effectiveDays(): number {
  const { days, launchDate } = insightsConfig;
  if (!launchDate) return days;
  const launchTime = new Date(launchDate).getTime();
  if (Number.isNaN(launchTime)) return days;
  const elapsed = Math.ceil(
    (Date.now() - launchTime) / 86_400_000
  );
  return Math.max(1, Math.min(days, elapsed));
}

async function getPostHogInsights(): Promise<InsightReport | null> {
  const days = effectiveDays();
  const dates = dateRange(days);

  if (dates.length === 0) return zeroReport();

  const points = await getDailyPageViews(days);
  const averageEngagedSeconds = await getAverageEngagedSeconds(days);

  const pointsMap = new Map(points.map((p) => [p.date, p]));
  const filledPoints = dates.map((date) => {
    const point = pointsMap.get(date);
    return {
      date,
      visitors: point?.visitors ?? 0,
      sessions: point?.sessions ?? 0,
      pageviews: point?.pageviews ?? 0,
    };
  });

  // Previous period: same number of days immediately before the current range.
  // All dates are UTC to match PostHog's HogQL timestamps.
  const previousStart = new Date(`${dates[0]}T00:00:00Z`);
  previousStart.setUTCDate(previousStart.getUTCDate() - days);
  const previousEnd = new Date(`${dates[0]}T00:00:00Z`);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);

  const previous = await getDailyPageViewsRange(
    previousStart.toISOString().slice(0, 10),
    previousEnd.toISOString().slice(0, 10),
  );

  return buildPostHogReport(filledPoints, previous, averageEngagedSeconds);
}
