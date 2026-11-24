import type { ExperienceItem } from "@/config/types";

export const experienceSectionConfig = {
  title: "Experience",
};


export const experienceConfig: ExperienceItem[] = [
  {
    id: "obi-devsecops",
    role: "Intern DevSecOps Engineer",
    company: "OBI Russia",
    period: "2026 - Present",
    summary:
      "Engineered a secure-by-default ecosystem by building threat-modeling templates, enforcing IaC guardrails, and integrating SAST/DAST policy gates across CI/CD.",
    highlights: [
      "Built threat-modeling templates and enforced IaC guardrails",
      "Integrated SAST/DAST policy gates across CI/CD",
      "Implemented the cyanide-framework honeypot for active defense",
    ],
    order: 1,
    enabled: true,
  },
  {
    id: "obi-helpdesk-l2",
    role: "IT Helpdesk Specialist L2",
    company: "OBI Russia",
    period: "2025 - 2026",
    summary:
      "Managed complex technical escalations and performed root-cause analysis for system and network issues.",
    highlights: [
      "Automated routine administrative workflows",
      "Deployed advanced endpoint hardening baselines",
    ],
    order: 2,
    enabled: true,
  },
  {
    id: "obi-helpdesk-l1",
    role: "IT Helpdesk Specialist L1",
    company: "OBI Russia",
    period: "2023 - 2025",
    summary:
      "Provided front-line technical support and incident triage for corporate users.",
    highlights: [
      "Managed access provisioning and assisted with MFA rollouts",
      "Created internal runbooks that cut average ticket resolution times",
    ],
    order: 3,
    enabled: true,
  },

];
