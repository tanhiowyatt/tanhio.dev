import { skillsConfig, skillsSectionConfig } from "@/config/skills";
import type { SkillIcon, SkillItem } from "@/config/types";
import { cn } from "@/lib/utils";
import {
  Terminal,
  Globe,
  Search,
  Shield,
  Bug,
  Database,
  Zap,
  Network,
  Key,
  Lock,
  Activity,
  Layout,
  Clock,
  Bot,
  PenTool,
} from "lucide-react";
import type { ComponentType } from "react";

const skillIconMap: Record<SkillIcon, ComponentType<{ size: string }>> = {
  nextjs: Layout,
  react: Activity,
  typescript: Terminal,
  javascript: Globe,
  tailwind: Shield,
  "ai-sdk": Bot,
  shadcn: Layout,
  "better-auth": Key,
  prisma: Database,
  trpc: Network,
  tanstack: Clock,
  claude: Bot,
  cursor: PenTool,
  python: Terminal,
  bash: Terminal,
  nmap: Search,
  ffuf: Search,
  amass: Globe,
  wireshark: Network,
  burp: Shield,
  zap: Zap,
  sqlmap: Database,
  nuclei: Bug,
  metasploit: Bug,
  netcat: Network,
  searchsploit: Search,
  bloodhound: Key,
  mimikatz: Lock,
};

const enabledSkills = skillsConfig
  .filter((skill) => skill.enabled !== false)
  .sort((a, b) => a.order - b.order);

function SkillChip({ skill }: { skill: SkillItem }) {
  const Icon = skillIconMap[skill.icon];

  // Deliberately no hover:/focus-visible: styles here. These chips are labels,
  // not controls: there is nothing to click and nothing to focus (a div with
  // no tabIndex can never receive focus, so a focus ring is unreachable CSS).
  // Styling them like interactive filter chips made users click them, which
  // PostHog then recorded as $dead_click. If these ever become filters or
  // links, restore the affordances along with the handler.
  const chipClasses =
    "no-js-visible inline-flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1 text-sm text-muted-foreground";

  return (
    <div className={chipClasses} aria-label={skill.name}>
      <Icon size="18" />
      <span className="font-medium">{skill.name}</span>
    </div>
  );
}

export function Skills() {
  const skills = enabledSkills;
  const categories = skillsSectionConfig.categories;

  return (
    <section className="pt-6">
      <h2 className="no-js-visible section-heading">
        {skillsSectionConfig.title}
      </h2>
      {categories.map((category, groupIndex) => {
        const categorySkills = skills.filter(
          (skill) => skill.category === category.id,
        );

        if (categorySkills.length === 0) return null;

        return (
          <div
            key={category.id}
            className={cn(
              "flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-6 px-6 py-3.5 border-b",
              groupIndex === 3 ? "border-none" : "",
            )}
          >
            <span className="shrink-0 w-36 font-mono text-xs tracking-wider text-muted-foreground">
              {`0${groupIndex + 1}`.padStart(2, "0") + " " + category.label}
            </span>

            <div className="flex flex-wrap gap-2 flex-1">
              {categorySkills.map((skill) => (
                <SkillChip key={skill.id} skill={skill} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
