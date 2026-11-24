const CLICK_SOUND_SRC = "/keyboard-click.mp3";

let clickAudio: HTMLAudioElement | null = null;
let lastClickAt = 0;

/* One shared keyboard-click sound used for any click on the site. */
export function playClickSound() {
  const now = Date.now();
  if (now - lastClickAt < 100) return;
  lastClickAt = now;

  if (typeof window === "undefined") return;

  try {
    if (!clickAudio) {
      clickAudio = new Audio(CLICK_SOUND_SRC);
      clickAudio.preload = "auto";
      clickAudio.volume = 0.35;
    }

    clickAudio.currentTime = 0;
    void clickAudio.play().catch(() => {});
  } catch {
    // Audio is optional feedback; clipboard success must not depend on it.
  }
}
