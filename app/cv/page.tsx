import type { Metadata } from "next";
import Image from "next/image";
import { Download, Mail, Phone } from "lucide-react";
import { FaGithub, FaLinkedin, FaTelegram } from "react-icons/fa";

import { siteConfig } from "@/config/site";
import { Footer } from "@/components/landing/footer";
import {
  cvConfig,
  cvEducation,
  cvLanguages,
  cvLinks,
  cvProjects,
  cvSkills,
  getEnabledCvExperience,
} from "@/config/cv";

const PAGE_URL = `${siteConfig.meta.url}/cv`;

export const metadata: Metadata = {
  title: "CV",
  description: cvConfig.about,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: `${cvConfig.name} — Curriculum Vitae`,
    description: cvConfig.about,
    siteName: siteConfig.meta.shortTitle,
  },
  twitter: {
    card: "summary_large_image",
    title: `${cvConfig.name} — Curriculum Vitae`,
    description: cvConfig.about,
  },
};

function CvLinkIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "linkedin":
      return <FaLinkedin className="size-4" />;
    case "github":
      return <FaGithub className="size-4" />;
    case "telegram":
      return <FaTelegram className="size-4" />;
    case "email":
      return <Mail className="size-4" />;
    case "call":
      return <Phone className="size-4" />;
    case "pdf":
      return <Download className="size-4" />;
    default:
      return null;
  }
}

export default function CvPage() {
  return (
    <>
    <main
      id="cv"
      className="relative flex min-h-dvh flex-col overflow-x-clip border-x bg-background pt-16"
    >
      <section className="border-t border-dashed pt-4">
        <p className="px-6 pb-4 text-xs">CV</p>
        <h1 className="section-heading">{cvConfig.name}</h1>
        <div className="flex items-start gap-5 px-6 py-8 sm:py-10">
          <div className="min-w-0 flex-1">
            <p className="text-balance text-base font-medium tracking-tight">
              {cvConfig.role}
            </p>
            <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
              {cvConfig.about}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
              <a
                href={cvConfig.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="micro-transition inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Open PDF
                <Download aria-hidden className="size-4" />
              </a>
              <div className="flex items-center gap-3.5 text-muted-foreground">
                {cvLinks
                  .filter((link) => link.icon !== "pdf")
                  .map((link) => {
                    const external = link.icon !== "email";
                    return (
                      <a
                        key={link.id}
                        href={link.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        aria-label={link.label}
                        className="micro-transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        <CvLinkIcon icon={link.icon} />
                      </a>
                    );
                  })}
              </div>
            </div>
          </div>
          <div className="w-24 shrink-0 sm:w-28">
            <div className="aspect-square overflow-hidden rounded-full border border-border">
              <Image
                src={siteConfig.personal.avatar.src}
                alt={siteConfig.personal.avatar.alt}
                width={112}
                height={112}
                className="size-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-dashed pt-6">
        <h2 className="section-heading mb-3">About</h2>
        <p className="px-6 text-sm leading-relaxed text-muted-foreground">
          {cvConfig.about}
        </p>
      </section>

      <section className="border-t border-dashed pt-3">
        <h2 className="section-heading mb-3">Work Experience</h2>
        <div className="space-y-4 px-6 pb-2">
          {getEnabledCvExperience().map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-1 sm:flex-row sm:gap-5"
            >
              <div className="w-32 shrink-0 font-mono text-xs text-muted-foreground">
                {item.period}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-foreground">
                  {item.role}
                </h3>
                <p className="text-sm text-muted-foreground">{item.company}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.summary}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-dashed pt-3">
        <h2 className="section-heading mb-3">Projects</h2>
        <div className="space-y-4 px-6 pb-2">
          {cvProjects.map((project) => (
            <article
              key={project.id}
              className="flex flex-col gap-1 sm:flex-row sm:gap-5"
            >
              <div className="w-32 shrink-0 font-mono text-xs text-muted-foreground">
                {project.period}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-foreground">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {project.name}
                  </a>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-dashed pt-3">
        <h2 className="section-heading mb-3">Education</h2>
        <div className="space-y-4 px-6 pb-2">
          {cvEducation.map((edu) => (
            <article
              key={edu.id}
              className="flex flex-col gap-1 sm:flex-row sm:gap-5"
            >
              <div className="w-32 shrink-0 font-mono text-xs text-muted-foreground">
                {edu.period}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-foreground">
                  {edu.institution}
                </h3>
                <p className="text-sm text-muted-foreground">{edu.location}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {edu.degree}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-dashed pt-3">
        <h2 className="section-heading mb-3">Skills</h2>
        <div className="flex flex-wrap gap-2 px-6 pb-2">
          {cvSkills.map((skill) => (
            <span
              key={skill}
              className="select-none rounded-full border border-border/60 px-3 py-1.5 text-xs font-light text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-8 border-t border-dashed pt-3">
        <h2 className="section-heading mb-3">Languages</h2>
        <div className="space-y-3 px-6 pb-2">
          {cvLanguages.map((lang) => (
            <div
              key={lang.id}
              className="flex flex-col gap-1 sm:flex-row sm:gap-5"
            >
              <span className="w-32 shrink-0 text-sm text-muted-foreground">
                {lang.name}
              </span>
              <span className="flex-1 text-sm text-muted-foreground">
                {lang.level}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}
