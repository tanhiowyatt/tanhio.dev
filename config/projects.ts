import type { Project } from "@/config/types";

export const projectsSectionConfig = {
  title: "Work",
  liveButtonLabel: "View Product",
  liveTooltip: "Open project",
};

// Tanhio's own projects, taken from tanhio.dev. Rows without a bundled image
// fall back to the placeholder tile in the explorer's hover preview.
export const projectsConfig: Project[] = [
  {
    id: "cyanide-framework",
    title: "cyanide-framework",
    description:
      "Active defense honeypot framework for early threat detection, risk reduction, and security posture monitoring.",
    content:
      "## cyanide-framework\nAn advanced open-source honeypot framework that emulates SSH/Telnet to lure attackers and analyze their tactics. Provides active defense capabilities, threat detection, and posture monitoring.",
    image: "/images/projects/cyanide.png",
    imageAlt: "cyanide-framework",
    githubUrl: "https://github.com/tanhiowyatt/cyanide-framework",
    tags: ["Python", "SSH", "Telnet", "Honeypot", "Active Defense", "Security"],
    year: 2026,
    status: "shipped",
    category: "Security",
    order: 1,
    enabled: true,
  },
  {
    id: "lentaflow",
    title: "lentaflow",
    description:
      "Open-source CLI tool to automate work processes. Written in Python with shell scripts for installation and uninstallation.",
    content:
      "## lentaflow\nAn open-source CLI tool written in Python with shell scripts for installation and uninstallation, used to automate routine work processes.",
    image: "/images/projects/lentaflow.png",
    imageAlt: "lentaflow",
    githubUrl: "https://github.com/tanhiowyatt/lentaflow",
    tags: ["Python", "Shell", "CLI", "Automation"],
    year: 2026,
    status: "shipped",
    category: "Automation",
    order: 2,
    enabled: true,
  },
];
