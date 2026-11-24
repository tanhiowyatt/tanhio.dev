import { useCallback, useEffect, useState } from "react";

export type CopyStatus = "idle" | "copied" | "error";

export function useCopy() {
  const [status, setStatus] = useState<CopyStatus>("idle");

  const copy = useCallback(async (value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(value);
        setStatus("copied");
        return;
      } catch {
        // Clipboard write was rejected; fall back to execCommand below.
      }
    }
    /* Fallback for environments without the Clipboard API (or when writeText
       is rejected, e.g. a non-secure context). Writes to a temporary textarea
       and copies via document.execCommand("copy"). */
    if (typeof document === "undefined") {
      setStatus("error");
      return;
    }
    try {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setStatus("copied");
    } catch {
      // Clipboard is unavailable over plain HTTP or when permission is denied.
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (status === "idle") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  return { status, copy };
}
