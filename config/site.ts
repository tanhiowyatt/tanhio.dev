import { socialsConfig } from "@/config/socials";
import type { AboutGreetings, AboutItem, FooterConfig, PortfolioConfig } from "@/config/types";



export const aboutGreetings: AboutGreetings = {
  morning: "Good morning!",
  afternoon: "Good afternoon!",
  evening: "Good evening!",
};

export const aboutItems: AboutItem[] = [
  {
    id: "build",
    lead: "I'm a Security Engineer,",
    body: "application and infrastructure pentesting, DevSecOps, active defense architecture.",
  },
  {
    id: "share",
    lead: "Writing at tanhio.dev",
    body: "on AppSec, internet infrastructure, and software freedom (EN/RU/PL).",
  },
  {
    id: "learn",
    lead: "Currently",
    body: "a DevSecOps intern at OBI Russia, building SyntLabs.",
  },
];

export const footerConfig: FooterConfig = {
  quote: "Stay Hungry. Stay Foolish.",
  attribution: "Steve Jobs",
  credit: "Made with love and lots of energy drinks.",
  artwork: {
    src: "/images/footer-garden-strip.webp",
    width: 1264,
    height: 600,
  },
};

export const siteConfig: PortfolioConfig = {
  meta: {
    url: "https://tanhio.dev",
    title: "tanhiowyatt — Security Engineer",
    titleTemplate: "tanhiowyatt | %s",
    shortTitle: "tanhiowyatt",
    description:
      "Security Engineer focusing on application and infrastructure penetration testing, DevSecOps integrations, and active defense architecture.",
    keywords: [
      "Security Engineer",
      "Penetration Testing",
      "Application Security",
      "Infrastructure Security",
      "DevSecOps",
      "Active Defense",
      "Threat Modeling",
      "IaC Guardrails",
      "Honeypot",
      "tanhiowyatt",
      "Tanhio",
      "Security",
    ],
    authors: [{ name: "Tanhio", url: "https://tanhio.dev" }],
    creator: "tanhiowyatt",
    publisher: "tanhiowyatt",
    classification: "Portfolio",
    category: "technology",
    locale: "en_US",
    ogImage: {
      url: "/images/linkpreview.png",
      width: 1200,
      height: 600,
      alt: "tanhiowyatt — Security Engineer focusing on penetration testing",
    },
    twitterCreator: "@tanhiowyatt",
    icon: "/favicon.svg",
    appleIcon: "/apple-touch-icon.png",
    manifest: {
      name: "tanhiowyatt — Security Engineer",
      short_name: "tanhiowyatt",
      description:
        "Security Engineer focusing on penetration testing, application security, and active defense architecture.",
      start_url: "/",
      display: "standalone",
      background_color: "#111110",
      theme_color: "#111110",
      icons: [
        {
          src: "/favicon.ico",
          sizes: "any",
          type: "image/x-icon",
        },
      ],
    },
    robots: {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/api/"],
        },
      ],
      sitemap: "https://tanhio.dev/sitemap.xml",
    },
    sitemap: [
      { url: "https://tanhio.dev", changeFrequency: "monthly", priority: 1 },
      {
        url: "https://tanhio.dev/blog",
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: "https://tanhio.dev/cv",
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: "https://tanhio.dev/projects",
        changeFrequency: "monthly",
        priority: 0.6,
      },
    ],
  },
  personal: {
    fullName: "Tanhio",
    firstName: "Tanhio",
    avatar: {
      src: "/images/portrait.jpeg",
      alt: "Portrait of Tanhio",
      fallback: "T",
    },
    telegram: {
      handle: "@tanhiowyatt",
      href: "https://t.me/tanhiowyatt",
    },
    location: {
      label: "Moscow, Russia",
      timeZone: "Europe/Moscow",
      timeLabel: "Moscow time",
    },
    githubUsername: "tanhiowyatt",
  },
  sectionOrder: [
    "projects",
    "socials",
    "skills",
    "about",
    "sponsors",
    "insights",
    "github",
    "bookshelf",
  ],
  sectionFlags: {
    socials: true,
    skills: true,
    about: true,
    projects: true,
    bookshelf: true,
    sponsors: true,
    insights: true,
    experience: false,
    services: false,
    workflow: false,
    github: true,
    contact: false,
  },
  banner: {
    imageSrc: "/public/images/hero-banner.gif",
    imageAlt: "Banner image from the movie 'bladerunner 2049' showing a futuristic cityscape with neon lights and flying vehicles.",
    openSourceUrl: "https://github.com/tanhiowyatt/tanhio.dev",
    openSourceTooltip: "This project is open source!",
    themeToggleLabel: "Toggle theme",
    themeShortcut: "D",
    themeTooltip: "Toggle theme",
    switchAudioSrc: "/switch.mp3",
  },
  about: {
    title: "Hello there !",
    body: aboutItems.map(({ lead, body }) => `${lead} ${body}`).join(" "),
  },
  services: {
    title: "What I build best",
    items: [
      "Founder-led SaaS MVPs with auth, onboarding, payments, dashboards, and admin tools.",
      "Internal tools and back-office workflows that need clear roles, clean data models, and fast delivery.",
      "Next.js products that need one strong feature shipped or a messy flow rebuilt without overengineering.",
    ],
  },
  workflow: {
    title: "How I run a project",
    items: [
      {
        label: "Scope",
        description:
          "We agree on one core workflow, fixed deliverables, and what is explicitly out of scope.",
        icon: "scope",
      },
      {
        label: "Communication",
        description:
          "You get short async updates, working demos, and clear blockers instead of vague progress.",
        icon: "communication",
      },
      {
        label: "Handoff",
        description:
          "I ship clean code, deployment support, and next-step recommendations after the first release.",
        icon: "handoff",
      },
    ],
  },
  contact: {
    title: "Follow the build, not just the launch",
    description:
      "On X, I share product progress, technical decisions, failed ideas, and the lessons that only appear after shipping.",
    pricing: [
      {
        label: "Minimum engagement",
        value: "$700",
        note: "A good fit for smaller scoped builds, feature sprints, or setup work.",
      },
      {
        label: "Typical MVP range",
        value: "$2.5k-$5k",
        note: "Most founder MVP builds land here once scope, integrations, and handoff are clear.",
      },
      {
        label: "How pricing works",
        value: "Final quote depends on scope",
        note: "Complex workflows, billing, roles, and admin tooling push projects higher.",
      },
    ],
    channels: socialsConfig.filter((item) =>
      ["email", "x", "discord"].includes(item.id),
    ),
  },
  
  
  
};
