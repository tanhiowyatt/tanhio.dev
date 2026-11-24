"use client";

import {
  Contrast,
  BookmarkCheckIcon,
  FolderOpen,
  HeartHandshake,
  Home,
  Link,
  Monitor,
  Moon,
  Sun,
} from "@/components/shared/site-icons";
import { FaGithub } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useMemo } from "react";

import {
  CommandPalette,
  type CommandPaletteGroup,
  type CommandPalettePage,
} from "@/components/ui/command-palette";
import { bookshelfConfig } from "@/config/books";
import { siteConfig } from "@/config/site";

/**
 * The site-wide command palette, mounted once in the header. Every route is a
 * couple of keystrokes away — top-level pages, each showcase component, each
 * case study — plus theme controls and quick actions.
 */
export function SiteCommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();

  const groups = useMemo<CommandPaletteGroup[]>(() => {
    const go = (href: string) => () => router.push(href);

    return [
      {
        label: "Navigate",
        items: [
          {
            id: "go-home",
            label: "Home",
            icon: <Home className="size-4" />,
            keywords: ["landing", "start", "top"],
            onSelect: go("/"),
          },
          {
            id: "go-cv",
            label: "CV",
            icon: <FolderOpen className="size-4" />,
            keywords: ["resume", "curriculum vitae", "experience"],
            onSelect: go("/cv"),
          },
          {
            id: "go-bookshelf",
            label: bookshelfConfig.title,
            icon: <BookmarkCheckIcon className="size-4" />,
            keywords: ["books", "reading", "library", "shelf"],
            onSelect: go(bookshelfConfig.href),
          },
          {
            id: "go-sponsor",
            label: "Sponsor",
            icon: <HeartHandshake className="size-4" />,
            keywords: ["orbit", "seat", "support", "back the work", "donate"],
            onSelect: go("/sponsor"),
          },
        ],
      },
      {
        label: "Actions",
        items: [
          {
            id: "open-github",
            label: "Open GitHub",
            icon: <FaGithub className="size-4" />,
            badge: "external",
            keywords: ["repo", "source", "repository", "code", "stars"],
            onSelect: () =>
              window.open(siteConfig.banner.openSourceUrl, "_blank"),
          },
          {
            id: "copy-url",
            label: "Copy site URL",
            icon: <Link className="size-4" />,
            keywords: ["link", "share", "address", "copy"],
            onSelect: () => {
              navigator.clipboard
                ?.writeText(siteConfig.meta.url)
                .catch(() => {});
            },
          },
          {
            id: "change-theme",
            label: "Change theme…",
            icon: <Contrast className="size-4" />,
            keywords: ["dark", "light", "system", "appearance", "mode"],
            page: "theme",
          },
        ],
      },
    ];
  }, [router]);

  const pages = useMemo<CommandPalettePage[]>(
    () => [
      {
        id: "theme",
        label: "Theme",
        placeholder: "Search themes…",
        items: [
          {
            id: "theme-light",
            label: "Light",
            icon: <Sun className="size-4" />,
            onSelect: () => setTheme("light"),
          },
          {
            id: "theme-dark",
            label: "Dark",
            icon: <Moon className="size-4" />,
            onSelect: () => setTheme("dark"),
          },
          {
            id: "theme-system",
            label: "System",
            icon: <Monitor className="size-4" />,
            onSelect: () => setTheme("system"),
          },
        ],
      },
    ],
    [setTheme],
  );

  return (
    <CommandPalette
      groups={groups}
      pages={pages}
      open={open}
      onOpenChange={onOpenChange}
      recents
      disableOnMobile
      hotkey={false}
    />
  );
}
