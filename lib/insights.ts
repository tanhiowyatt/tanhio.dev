import "server-only";

import { insightsConfig } from "@/config/insights";
import type {
  InsightPoint,
  InsightReport,
  InsightSummary,
} from "@/config/types";
import { getDailyPageViews, getDailyPageViewsRange } from "@/lib/posthog-analytics";

const DAY_MS = 86_400_000;

/** Включает тестовый отчёт с нулями вместо реальных данных PostHog. */
function testModeEnabled(): boolean {
  return process.env.INSIGHTS_TEST_MODE === "true";
}

/*
 * Builds an InsightReport from PostHog daily page view points.
 * PostHog captures $pageview events client-side; sessions and engaged time are
 * not available through the Query API, so visitors/sessions/pageviews all
 * map to the page view total and averageEngagedSeconds is null.
 */
function buildPostHogReport(
  points: { date: string; pageViews: number }[],
  previous: { date: string; pageViews: number }[],
): InsightReport {
  const total = points.reduce((sum, p) => sum + p.pageViews, 0);
  const previousTotal = previous.reduce((sum, p) => sum + p.pageViews, 0);
  const summary: InsightSummary = {
    visitors: total,
    sessions: total,
    pageviews: total,
    averageEngagedSeconds: null,
  };
  const previousSummary: InsightSummary = {
    visitors: previousTotal,
    sessions: previousTotal,
    pageviews: previousTotal,
    averageEngagedSeconds: null,
  };
  return {
    points: points.map((p) => ({ date: p.date, visitors: p.pageViews })),
    summary,
    previous: previousSummary,
  };
}

function dateRange(days: number): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = Date.parse(`${today.toISOString().slice(0, 10)}T00:00:00Z`);
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

async function getPostHogInsights(): Promise<InsightReport | null> {
  const days = insightsConfig.days;
  const dates = dateRange(days);

  const points = await getDailyPageViews(days);
  if (points.length === 0) return null;

  // Previous period: same number of days immediately before the current range.
  const previousStart = new Date(dates[0]);
  previousStart.setDate(previousStart.getDate() - days);
  const previousEnd = new Date(dates[0]);
  previousEnd.setDate(previousEnd.getDate() - 1);

  const previous = await getDailyPageViewsRange(
    previousStart.toISOString().slice(0, 10),
    previousEnd.toISOString().slice(0, 10),
  );

  return buildPostHogReport(points, previous);
}
