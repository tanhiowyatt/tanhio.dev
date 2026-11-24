import type { ExperienceItem } from "@/config/types";
import { experienceConfig } from "@/config/experience";

export const cvConfig = {
  name: "tanhiowyatt",
  role: "Security Engineer",
  about:
    "Focused on application security, infrastructure penetration testing, DevSecOps integrations, and active defense architecture. Dedicated to building resilient systems.",
  pdfUrl: "/files/tanhiowyatt_CV.pdf",
};

export type CvLink = {
  id: string;
  label: string;
  href: string;
  icon: "linkedin" | "github" | "telegram" | "email" | "call" | "pdf";
  order: number;
};

export const cvLinks: CvLink[] = [
  { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com/in/tanhiowyatt", icon: "linkedin", order: 1 },
  { id: "github", label: "GitHub", href: "https://github.com/tanhiowyatt", icon: "github", order: 2 },
  { id: "telegram", label: "Telegram", href: "https://t.me/tanhio", icon: "telegram", order: 3 },
  { id: "email", label: "Email", href: "mailto:contact@tanhio.dev", icon: "email", order: 4 },
  { id: "cal", label: "Book a call", href: "https://cal.com/tanhiowyatt", icon: "call", order: 5 },
  { id: "pdf", label: "Download PDF CV", href: "/files/tanhiowyatt_CV.pdf", icon: "pdf", order: 6 },
];

export type CvProject = {
  id: string;
  period: string;
  name: string;
  url: string;
  description: string;
  order: number;
};

export const cvProjects: CvProject[] = [
  {
    id: "cyanide-framework",
    period: "Active",
    name: "cyanide-framework",
    url: "https://github.com/tanhiowyatt/cyanide-framework",
    description:
      "Active defense honeypot framework designed for early threat detection, risk reduction, and security posture monitoring.",
    order: 1,
  },
  {
    id: "lentaflow",
    period: "Active",
    name: "lentaflow",
    url: "https://github.com/tanhiowyatt/lentaflow",
    description:
      "Open-source application flow visualization and management solution.",
    order: 2,
  },
];

export type CvEducation = {
  id: string;
  period: string;
  institution: string;
  location: string;
  degree: string;
  order: number;
};

export const cvEducation: CvEducation[] = [
  {
    id: "hse-master",
    period: "2026 - 2028",
    institution: "HSE - Higher School of Economics",
    location: "Moscow, Russia",
    degree: "Master's Degree in Information Security",
    order: 1,
  },
  {
    id: "mirea-devops",
    period: "2023 - 2024",
    institution: "RTU MIREA - Russian Technology University MIREA",
    location: "Moscow, Russia",
    degree: "Professional Development in DevOps",
    order: 2,
  },
  {
    id: "mirea-bachelor",
    period: "2022 - 2026",
    institution: "RTU MIREA - Russian Technology University MIREA",
    location: "Moscow, Russia",
    degree: "Bachelor's Degree in Information Security",
    order: 3,
  },
];

export const cvSkills = [
  "CI/CD",
  "Golang",
  "Pentest",
  "Server Sec.",
  "Linux Adm",
  "Windows Adm",
  "Python",
];

export type CvLanguage = {
  id: string;
  name: string;
  level: string;
  order: number;
};

export const cvLanguages: CvLanguage[] = [
  { id: "russian", name: "Russian", level: "Native (C2)", order: 1 },
  { id: "english", name: "English", level: "Professional (B2)", order: 2 },
  { id: "polish", name: "Polish", level: "Intermediate (B1)", order: 3 },
];

export function getEnabledCvExperience(): ExperienceItem[] {
  return experienceConfig
    .filter((item) => item.enabled !== false)
    .sort((a, b) => a.order - b.order);
}
