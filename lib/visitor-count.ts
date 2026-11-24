/* Lifetime visitor count from PostHog Analytics.
 *
 * Queries the PostHog Query API for total page views. Without credentials the
 * counter stays hidden instead of erroring.
 */

import { getTotalPageViews } from "@/lib/posthog-analytics";

export async function getVisitorCount(): Promise<number | null> {
  if (!process.env.POSTHOG_API_KEY) {
    return null;
  }

  const pageViews = await getTotalPageViews();
  if (typeof pageViews === "number" && pageViews > 0) {
    return pageViews;
  }
  return null;
}
