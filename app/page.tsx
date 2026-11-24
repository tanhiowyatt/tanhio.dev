import { About } from "@/components/landing/about";
import { Bookshelf } from "@/components/landing/bookshelf";
import { Footer } from "@/components/landing/footer";
import { GitHubSection } from "@/components/landing/github-section";
import { Hero } from "@/components/landing/hero";
import { Insights } from "@/components/landing/insights";
import { HomeProjectExplorer } from "@/components/landing/home-project-explorer";
import { HomeSectionRail } from "@/components/landing/home-section-rail";
import { Skills } from "@/components/landing/skills";
import Social from "@/components/landing/social";
import { SponsorsSection } from "@/components/landing/sponsors";
import { SideNote } from "@/components/shared/side-note";
import { projectsConfig, projectsSectionConfig } from "@/config/projects";
import { getEnabledBooks } from "@/config/books";
import { sectionNotes } from "@/config/section-notes";
import { siteConfig } from "@/config/site";
import type { SectionId } from "@/config/types";
import type { ReactElement } from "react";
import type { Metadata } from "next";
import type { ProjectExplorerItem } from "@/components/project-explorer";

export const metadata: Metadata = {
  title: "tanhiowyatt | security engineer",
};

/* The explorer never reads case-study content, tags, or metrics, so those
   fields stay on the server instead of crossing the client boundary. */
const explorerProjects: ProjectExplorerItem[] = projectsConfig.map(
  (project) => ({
    id: project.id,
    title: project.title,
    year: project.year,
    description: project.description,
    category: project.category,
    status: project.status,
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
    image: project.image,
    imageAlt: project.imageAlt,
    enabled: project.enabled,
    order: project.order,
  }),
);


const staticSections: Partial<
  Record<Exclude<SectionId, "github">, ReactElement>
> = {
  socials: <Social />,
  skills: <Skills />,
  about: <About />,
  projects: (
    <HomeProjectExplorer
      projects={explorerProjects}
      title={projectsSectionConfig.title}
      className="pt-3"
      showBorder={false}
    />
  ),
  bookshelf: <Bookshelf books={getEnabledBooks()} />,
  insights: <Insights />,
  sponsors: <SponsorsSection />,
};

export default function Home() {
  const showGithub =
    siteConfig.sectionFlags.github && Boolean(process.env.GITHUB_TOKEN);
  const visibleSections = siteConfig.sectionOrder.filter(
    (id) => siteConfig.sectionFlags[id] && (id !== "github" || showGithub),
  );

  return (
    <>
      <main
        id="main-content"
        className="relative flex min-h-dvh flex-col gap-y-4 overflow-x-clip border-x bg-background pt-16 xl:overflow-x-visible"
      >
        <div id="hero" className="bg-background scroll-mt-20 border-t border-dashed pt-4">
          <Hero />
        </div>
        {siteConfig.sectionOrder.map((sectionId) => {
          if (
            !siteConfig.sectionFlags[sectionId] ||
            (sectionId === "github" && !showGithub)
          ) {
            return null;
          }

          const content =
            sectionId === "github" ? (
              <GitHubSection key="github" />
            ) : (
              staticSections[sectionId]
            );
          const note = sectionNotes[sectionId];

          return (
            <div
              key={sectionId}
              id={sectionId}
              className="relative border-t border-dashed bg-background scroll-mt-20 pt-4"
            >
              {note && <SideNote side={note.side}>{note.text}</SideNote>}
              {content}
            </div>
          );
        })}
      </main>
      <Footer />
      <HomeSectionRail
        items={[
          { id: "hero", label: "Top" },
          ...visibleSections.map((id) => ({
            id,
            label: id === "github" ? "GitHub" : `${id.charAt(0).toUpperCase()}${id.slice(1)}`,
          })),
        ]}
      />
    </>
  );
}
