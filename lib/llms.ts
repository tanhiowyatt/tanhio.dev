/**
 * Generators for the `llms.txt` index and the `llms-full.txt` single-file dump.
 *
 * Both are derived entirely from `config/`, so content never has to be kept in
 * sync by hand. Everything is server-only: the routes that call these are
 * prerendered at build time.
 */

import { experienceConfig } from "@/config/experience";
import { projectsConfig } from "@/config/projects";
import type { Project } from "@/config/types";
import { skillsConfig, skillsSectionConfig } from "@/config/skills";
import { siteConfig } from "@/config/site";
import { socialsConfig } from "@/config/socials";

/** House rule: no em dashes anywhere in generated copy. */
function dedash(input: string): string {
  return input.replace(/\u2014/g, "-").replace(/\u2013/g, "-");
}

/** Collapse to a single line for use inside a link list. */
function oneLine(input: string): string {
  return dedash(input).replace(/\s+/g, " ").trim();
}

function projectUrl(project: Project): string {
  return `${siteConfig.meta.url}/project/${project.id}`;
}

function enabledProjects(): Project[] {
  return [...projectsConfig]
    .filter((p) => p.enabled !== false)
    .sort((a, b) => a.order - b.order);
}

function stackLines(): string[] {
  return skillsSectionConfig.categories.map((category) => {
    const names = [...skillsConfig]
      .filter((s) => s.enabled !== false && s.category === category.id)
      .sort((a, b) => a.order - b.order)
      .map((s) => s.name);
    return names.length > 0
      ? `- ${category.label}: ${names.join(", ")}`
      : `- ${category.label}: none listed`;
  });
}

function contactLines(): string[] {
  return [...socialsConfig]
    .filter((s) => s.enabled !== false)
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const target = s.href ?? s.copyValue ?? s.handle;
      return target
        ? `- ${s.platform}: ${s.handle} (${target})`
        : `- ${s.platform}: ${s.handle}`;
    });
}

function projectIndexLines(): string[] {
  return enabledProjects().map(
    (p) => `- [${oneLine(p.title)}](${projectUrl(p)}): ${oneLine(p.description)}`,
  );
}

/**
 * `llms.txt`: a short, link-dense index. Follows the llmstxt.org shape, an H1,
 * a blockquote summary, then `##` sections of `- [name](url): description`.
 */
export function buildLlmsTxt(): string {
  const { meta, personal, about } = siteConfig;

  const sections: string[] = [
    `# ${personal.fullName}`,
    "",
    `> ${oneLine(meta.description)}`,
    "",
    `Independent full-stack developer based in ${personal.location.label}. Builds SaaS products end to end: from the first rough idea to product flows, data models, deployment, and the moment real people use them.`,
    "",
    "## About",
    "",
    oneLine(about.body),
    "",
    "## Projects",
    "",
    ...projectIndexLines(),
    "",
    "## Stack",
    "",
    ...stackLines(),
    "",
    "## Experience",
    "",
    ...experienceConfig
      .filter((e) => e.enabled !== false)
      .sort((a, b) => a.order - b.order)
      .map(
        (e) =>
          `- ${oneLine(e.role)}, ${oneLine(e.company)} (${oneLine(e.period)}): ${oneLine(e.summary)}`,
      ),
    "",
    "## Contact",
    "",
    ...contactLines(),
    "",
    "## Optional",
    "",
    `- [Full plain-text version of this site](${siteConfig.meta.url}/llms-full.txt): about, every project case study, and every component doc in one file`,
    `- [Sitemap](${siteConfig.meta.url}/sitemap.xml)`,
    `- [Source code](${siteConfig.banner.openSourceUrl}): this site is open source`,
  ];

  return `${sections.join("\n")}\n`;
}

/**
 * `llms-full.txt`: the whole site inlined. No links to follow, no truncation,
 * so a model can answer from this file alone.
 */
export async function buildLlmsFullTxt(): Promise<string> {
  const { meta, personal, about, services, workflow, contact } = siteConfig;

  const sections: string[] = [
    `# ${personal.fullName}`,
    "",
    `> ${oneLine(meta.description)}`,
    "",
    `Independent full-stack developer based in ${personal.location.label}. Builds SaaS products end to end: from the first rough idea to product flows, data models, deployment, and the moment real people use them.`,
    "",
    "## About",
    "",
    dedash(about.body),
    "",
    "## Stack",
    "",
    ...stackLines(),
    "",
    "## Experience",
    "",
  ];

  for (const item of experienceConfig
    .filter((e) => e.enabled !== false)
    .sort((a, b) => a.order - b.order)) {
    sections.push(
      `### ${oneLine(item.role)}, ${oneLine(item.company)} (${oneLine(item.period)})`,
      "",
      dedash(item.summary),
      "",
      ...(item.highlights ?? []).map((h) => `- ${dedash(h)}`),
      "",
    );
  }

  sections.push("## Projects", "");

  for (const project of enabledProjects()) {
    const links = [
      project.liveUrl ? `- Live: ${project.liveUrl}` : null,
      project.githubUrl ? `- Source: ${project.githubUrl}` : null,
      `- Case study: ${projectUrl(project)}`,
    ].filter((l): l is string => l !== null);

    sections.push(
      `### ${oneLine(project.title)}`,
      "",
      `${oneLine(project.description)}`,
      "",
      `Year: ${project.year} | Status: ${project.status} | Category: ${project.category} | Tags: ${project.tags.join(", ")}`,
      "",
      ...links,
      "",
      dedash(project.content ?? ""),
      "",
    );
  }

  sections.push("## Services", "");
  for (const item of services.items) {
    sections.push(`- ${dedash(item)}`);
  }

  sections.push("", "## How a project runs", "");
  for (const item of workflow.items) {
    sections.push(`- ${oneLine(item.label)}: ${dedash(item.description)}`);
  }

  sections.push("", "## Engagement", "");
  for (const tier of contact.pricing) {
    sections.push(`- ${oneLine(tier.label)}: ${oneLine(tier.value)}. ${dedash(tier.note)}`);
  }

  sections.push("", "## Contact", "", ...contactLines(), "");

  return `${sections.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

/** Exposed so the registry page can link the two files without hardcoding. */
export const llmsRoutes = {
  index: `${siteConfig.meta.url}/llms.txt`,
  full: `${siteConfig.meta.url}/llms-full.txt`,
} as const;
