/**
 * Moderation gate for component suggestions.
 *
 * Deterministic heuristics, always on. Catches link dumps, spam vocabulary,
 * and keyboard mashing without a network call.
 *
 * The gate fails open. Discord is the human review surface, so if anything
 * is unreachable the suggestion still gets delivered.
 */

import "server-only";

export type ModerationVerdict = {
  action: "allow" | "reject";
  reason?: "spam" | "low_quality";
  /** Line surfaced in the Discord embed so thresholds can be tuned on real traffic. */
  summary: string;
};


const SPAM_WORD_RE =
  /(casino|crypto\s*(pump|signal|invest)|viagra|escort|backlink|seo\s*services|buy\s*followers|telegram\s*channel|onlyfans|discount\s*code|whatsapp\s*group)/i;
const URL_RE = /https?:\/\/\S+/gi;
const CHAR_RUN_RE = /(.)\1{6,}/;


export async function moderateSuggestion(input: {
  idea: string;
  references: string;
  name: string;
}): Promise<ModerationVerdict> {
  return heuristicCheck(input) ?? {
    action: "allow",
    summary: "Heuristic checks only",
  };
}

/** Returns a rejecting verdict, or null when the text passes. */
function heuristicCheck(input: {
  idea: string;
  references: string;
}): ModerationVerdict | null {
  const { idea, references } = input;
  const combined = `${idea}\n${references}`;

  if (SPAM_WORD_RE.test(combined)) {
    return { action: "reject", reason: "spam", summary: "Heuristic: spam vocabulary" };
  }

  const urlCount = combined.match(URL_RE)?.length ?? 0;
  if (urlCount > 6) {
    return { action: "reject", reason: "spam", summary: `Heuristic: ${urlCount} links` };
  }

  if (CHAR_RUN_RE.test(combined)) {
    return { action: "reject", reason: "spam", summary: "Heuristic: character runs" };
  }

  const words = idea.toLowerCase().match(/[a-z]{3,}/g) ?? [];
  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  for (const count of counts.values()) {
    if (count > 8) {
      return { action: "reject", reason: "spam", summary: "Heuristic: word repetition" };
    }
  }

  const letters = idea.replace(/[^a-z]/gi, "");
  const uppercase = idea.replace(/[^A-Z]/g, "");
  if (letters.length >= 40 && uppercase.length / letters.length > 0.85) {
    return { action: "reject", reason: "spam", summary: "Heuristic: shouting" };
  }

  return null;
}

