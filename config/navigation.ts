import type { SiteNavigationItem } from "@/config/types";

export const navigationConfig = {
  label: "Site navigation",
  menu: "Menu",
  close: "Close navigation",
  search: "Open command palette",
  backToTop: "Back to top",
  githubLabel: "View source on GitHub (opens in a new tab)",
};

export const navigationItems: SiteNavigationItem[] = [
  { id: "home", label: "Home", href: "/", icon: "home", order: 0 },
  { id: "blog", label: "Blog", href: "/blog", icon: "journal", order: 1 },
  { id: "cv", label: "CV", href: "/cv", icon: "journal", order: 2 },
  { id: "sponsor", label: "Sponsor", href: "/sponsor", icon: "sparkles", order: 3 },
];
