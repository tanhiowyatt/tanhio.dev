"use client";

import { useEffect } from "react";
import { playClickSound } from "@/lib/click-sound";

/* Click sound plays only on interactive blocks and buttons (buttons, role=button
   elements, and navigable links/cards), not on every click across the site.
   The theme toggle is excluded because it plays its own switch audio. */
export function GlobalClickSound() {
  useEffect(() => {
    const handler = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.closest("[data-sound-ignore]")) return;
      const interactive = target.closest("button, [role='button'], a");
      if (!interactive) return;
      playClickSound();
    };

    window.addEventListener("click", handler, true);
    return () => window.removeEventListener("click", handler, true);
  }, []);

  return null;
}
