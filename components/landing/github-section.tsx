import { GitHubActivity } from "@/components/landing/github-activity";
import { siteConfig } from "@/config/site";
import { fetchGithubData } from "@/lib/github/github";
import { buildActivityCalendar } from "@/lib/github/github-activity";

const TODAY = new Date().toISOString().slice(0, 10);

export async function GitHubSection() {
  const contributions = await fetchGithubData(
    siteConfig.personal.githubUsername,
  );

  const calendar = buildActivityCalendar(contributions, TODAY);
  if (!calendar) {
    return null;
  }

  return (
    <div className="p-2">
      <div className="no-js-visible">
        <GitHubActivity key={calendar.end} calendar={calendar} />
      </div>
    </div>
  );
}
