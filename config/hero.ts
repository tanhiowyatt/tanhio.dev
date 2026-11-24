import type { HeroConfig } from "@/config/types";
import { MdWavingHand } from "react-icons/md";

export const heroConfig: HeroConfig = {
  greeting: "Hi!",
  waveEmoji: MdWavingHand,
  headlineBefore: "I am",
  highlightedPhrases: ["Security", "Engineer"],
  headlineAfter: "with a focus on application and infrastructure penetration testing.",
  description:
    "Security Engineer focused on application security, infrastructure penetration testing, DevSecOps integrations, and active defense architecture.",
  descriptionHighlight: "Security Engineer",
};
