import type { MetadataRoute } from "next";
import type { ComponentType, SVGProps } from "react";

export type SectionId =
  | "socials"
  | "skills"
  | "about"
  | "projects"
  | "experience"
  | "services"
  | "workflow"
  | "github"
  | "bookshelf"
  | "sponsors"
  | "insights"
  | "contact";

export interface SectionFlags {
  [key: string]: boolean;
}

export interface SectionNoteConfig {
  text: string;
  side: "left" | "right";
}

export interface SiteMetaConfig {
  url: string;
  title: string;
  titleTemplate: string;
  shortTitle: string;
  description: string;
  keywords: string[];
  authors: Array<{ name: string; url: string }>;
  creator: string;
  publisher: string;
  classification: string;
  category: string;
  locale: string;
  ogImage: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
  twitterCreator: string;
  icon: string;
  appleIcon: string;
  googleVerification?: string;
  manifest: MetadataRoute.Manifest;
  robots: MetadataRoute.Robots;
  sitemap: Array<{
    url: string;
    changeFrequency:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never";
    priority: number;
  }>;
}

export interface PersonalInfo {
  fullName: string;
  firstName: string;
  avatar: {
    src: string;
    alt: string;
    fallback: string;
  };
  location: {
    label: string;
    timeZone: string;
    timeLabel: string;
  };
  githubUsername: string;
  telegram?: {
    handle: string;
    href: string;
  };
}

export interface HeroConfig {
  greeting: string;
  waveEmoji: string | React.ElementType;
  headlineBefore: string;
  highlightedPhrases: [string, string];
  headlineAfter: string;
  description: string;
  descriptionHighlight: string;
}


export interface AboutConfig {
  title: string;
  body: string;
}

export interface FooterConfig {
  quote: string;
  attribution: string;
  credit: string;
  artwork: {
    src: string;
    width: number;
    height: number;
  };
}

export type AboutGreetings = Record<"morning" | "afternoon" | "evening", string>;

export interface AboutItem {
  id: string;
  lead: string;
  illustration?: "browser" | "notebook" | "plane";
  body: string;
}

export type SkillCategory =
  | "language"
  | "frontend"
  | "backend"
  | "workflow-ai"
  | "recon"
  | "web"
  | "exploitation";

export interface SkillCategoryConfig {
  id: SkillCategory;
  label: string;
}

export interface SkillItem {
  id: string;
  name: string;
  icon: SkillIcon;
  category: SkillCategory;
  order: number;
  enabled?: boolean;
}

export type SkillIcon =
  | "nextjs"
  | "react"
  | "typescript"
  | "javascript"
  | "tailwind"
  | "ai-sdk"
  | "shadcn"
  | "better-auth"
  | "prisma"
  | "trpc"
  | "tanstack"
  | "claude"
  | "cursor"
  | "python"
  | "bash"
  | "nmap"
  | "ffuf"
  | "amass"
  | "wireshark"
  | "burp"
  | "zap"
  | "sqlmap"
  | "nuclei"
  | "metasploit"
  | "netcat"
  | "searchsploit"
  | "bloodhound"
  | "mimikatz";

export interface SocialLink {
  id: string;
  platform: string;
  handle: string;
  href?: string;
  icon: SocialIcon;
  order: number;
  enabled?: boolean;
  action?: "copy" | "external" | "mailto";
  copyValue?: string;
  shortcutKey?: string;
  tooltipDefault?: string;
}

export type SocialIcon =
  | "github"
  | "x"
  | "peerlist"
  | "discord"
  | "gmail"
  | "reddit"
  | "telegram"
  | "instagram"
  | "linkedin"
  | "tiktok"
  | "spotify";

export interface ProjectMetric {
  icon: "users" | "chart";
  label: string;
}

export type ProjectStatus = "building" | "new" | "shipped";

export interface Project {
  id: string;
  title: string;

  description: string;
  content?: string;
  image: string;
  imageAlt: string;
  liveUrl?: string;
  githubUrl?: string;

  year: number;
  status: ProjectStatus;
  category: string;

  tags: string[];
  metrics?: ProjectMetric[];
  order: number;
  enabled?: boolean;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  summary: string;
  highlights?: string[];
  order: number;
  enabled?: boolean;
}

export interface ListSectionConfig {
  title: string;
  items: string[];
}

export type WorkflowIcon = "scope" | "communication" | "handoff";

export interface WorkflowItem {
  label: string;
  description: string;
  icon?: WorkflowIcon;
}

export interface PricingAnchor {
  label: string;
  value: string;
  note: string;
}

export interface ContactConfig {
  title: string;
  description: string;
  pricing: PricingAnchor[];
  channels: SocialLink[];
}

export type LinkCardIcon = ComponentType<
  SVGProps<SVGSVGElement> & {
    size?: number | string;
    color?: string;
  }
>;

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: { src: string; width: number; height: number; alt: string };
  /** Original book page and the exact source of the locally stored artwork. */
  sourceUrl?: string;
  coverSourceUrl?: string;
  spine: {
    src: string;
    height: number;
    width: number;
    sourceUrl?: string;
  };
  order: number;
  enabled?: boolean;
}

export interface Sponsor {
  id: string;
  name: string;
  /** Optional date the supporter joined. */
  date?: string;
  url?: string;
  /** Square logo image, shown in the supporter list. Falls back to a generated avatar. */
  logo?: string;
  /** 0-based paid supporter seat index. Omitted for hand-edited supporters. */
  seat?: number;
  order: number;
  enabled?: boolean;
  /** Dodo payment id, present on sponsors added through the payment webhook. */
  paymentId?: string;
  /** False until the sponsor has submitted the claim form with url and logo. */
  claimed?: boolean;
}

export interface SponsorTier {
  id: string;
  name: string;
  /** One-time price in USD. */
  price: number;
  /** How long the seat stays up. Shown verbatim next to the price. */
  duration: string;
  description: string;
  /** Bullet-free short list of what the tier includes. */
  perks: string[];
  /** Marks the tier as the recommended one in the UI. */
  featured?: boolean;
  order: number;
  enabled?: boolean;
}

export interface SponsorsSectionConfig {
  label: string;
  heading: string;
  description: string;
  supportLabel: string;
  supportNote: string;
  seats: number;
  tiers: SponsorTier[];
}

/** One numbered point on the /sponsor page, used for the why and steps lists. */
export interface SponsorPagePoint {
  label: string;
  description: string;
}

export interface SponsorPageConfig {
  title: string;
  tagline: string;
  description: string;
  /** Serif italic caption under the hero mascot. */
  mascotCaption: string;
  whyHeading: string;
  why: SponsorPagePoint[];
  tierHeading: string;
  stepsHeading: string;
  steps: SponsorPagePoint[];
  ctaHeading: string;
  ctaDescription: string;
}

export type ComponentIcon =
  | "home"
  | "bookshelf"
  | "reactions"
  | "todo"
  | "globe"
  | "terminal"
  | "git"
  | "folder"
  | "blur"
  | "slider"
  | "carousel"
  | "theme"
  | "appearance"
  | "pills"
  | "channels"
  | "rail"
  | "bars"
  | "command"
  | "sparkles"
  | "prompt"
  | "models"
  | "stack"
  | "status"
  | "snake"
  | "rolodex"
  | "journal";


/** One daily data point on the insights chart. */
/** One daily data point on the insights chart. */
export interface InsightPoint {
  date: string;
  visitors: number;
}

/** Aggregated metrics for a 7-day period. */
export interface InsightSummary {
  visitors: number;
  sessions: number;
  pageviews: number;
  averageEngagedSeconds: number | null;
}

/** Full insights report: current and previous period points plus summaries. */
export interface InsightReport {
  points: InsightPoint[];
  summary: InsightSummary;
  previous: InsightSummary;
}

export interface SiteNavigationItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentIcon;
  order: number;
}

export interface PortfolioConfig {
  meta: SiteMetaConfig;
  personal: PersonalInfo;
  sectionOrder: SectionId[];
  sectionFlags: Record<SectionId, boolean>;
  banner: {
    openSourceUrl: string;
    openSourceTooltip: string;
    themeToggleLabel: string;
    themeShortcut: string;
    themeTooltip: string;
    switchAudioSrc: string;
    imageSrc: string;
    imageAlt: string;
  };
  about: AboutConfig;
  services: ListSectionConfig;
  workflow: {
    title: string;
    items: WorkflowItem[];
  };
  contact: ContactConfig;
}


