"use client";

import { useTonConnectUI } from "@tonconnect/ui-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Loader2 } from "@/components/shared/site-icons";

export function TonPayButton({
  className,
  compact = false,
  onClick,
}: { className?: string; compact?: boolean; onClick?: () => void } = {}) {
  const [tonConnectUI] = useTonConnectUI();
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "connecting" | "sending" | "verifying"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isBusy =
    status === "connecting" || status === "sending" || status === "verifying";

  const stopDisconnectTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startDisconnectTimer = useCallback(() => {
    stopDisconnectTimer();
    timerRef.current = setTimeout(async () => {
      timerRef.current = null;
      try {
        await tonConnectUI?.disconnect();
      } catch {
        // ignore disconnect errors
      }
      setStatus("idle");
    }, 5 * 60 * 1000);
  }, [tonConnectUI, stopDisconnectTimer]);

  useEffect(() => {
    if (tonConnectUI?.connected && !timerRef.current) {
      startDisconnectTimer();
    }
    return () => {
      stopDisconnectTimer();
    };
  }, [tonConnectUI, startDisconnectTimer, stopDisconnectTimer]);

  useEffect(() => {
    if (status !== "verifying" || !orderId) return;

    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      try {
        const response = await fetch(`/api/ton/payment/status?id=${orderId}`);
        const data = await response.json();
        if (data.paid) {
          if (!cancelled) {
            router.push(`/sponsor/claim?orderId=${orderId}`);
          }
          return;
        }
        if (!cancelled) setTimeout(poll, 5000);
      } catch {
        if (!cancelled) setTimeout(poll, 5000);
      }
    };
    poll();

    return () => {
      cancelled = true;
      stopDisconnectTimer();
    };
  }, [status, orderId, router, stopDisconnectTimer]);

  const handlePay = async () => {
    onClick?.();
    setErrorMessage(null);

    try {
      if (!tonConnectUI?.connected) {
        // Reserve scrollbar space ahead of time so the TON Connect SDK's own
        // overflow: hidden (set when the wallet modal opens) never changes
        // page width. Only applied when a scrollbar actually exists.
        const hasScrollbar =
          document.documentElement.scrollHeight > document.documentElement.clientHeight;
        if (hasScrollbar) {
          document.documentElement.style.scrollbarGutter = "stable";
        }

        // Pin the header in place so the SDK's overflow: hidden doesn't
        // trigger sticky header recalculation and make it jerk. Capture the
        // exact position, switch to fixed at the same coordinates, and pad
        // the body by the header's true flow height (border box + margins)
        // so page content doesn't shift when the header leaves flow.
        const header = document.querySelector("header") as HTMLElement | null;
        if (header) {
          const rect = header.getBoundingClientRect();
          const style = window.getComputedStyle(header);
          const flowHeight =
            rect.height +
            (parseFloat(style.marginTop) || 0) +
            (parseFloat(style.marginBottom) || 0);
          if (flowHeight > 0) {
            document.body.style.paddingTop = `${flowHeight}px`;
          }
          header.style.position = "fixed";
          header.style.top = `${rect.top}px`;
          header.style.left = `${rect.left}px`;
          header.style.width = `${rect.width}px`;
        }

        setStatus("connecting");
        try {
          await tonConnectUI?.connectWallet();
        } finally {
          if (header) {
            header.style.position = "";
            header.style.top = "";
            header.style.left = "";
            header.style.width = "";
          }
          document.body.style.paddingTop = "";
          if (hasScrollbar) {
            document.documentElement.style.scrollbarGutter = "";
          }
        }

        if (!tonConnectUI?.connected) {
          throw new Error("Failed to connect wallet. Try again.");
        }
        startDisconnectTimer();
      }

      setStatus("sending");
      const response = await fetch("/api/ton/payment/create", { method: "POST" });
      if (!response.ok) throw new Error("Failed to create payment order.");
      const { orderId: createdOrderId, address, commentEncoded, amount } = await response.json();
      setOrderId(createdOrderId);

      await tonConnectUI?.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{ address, amount, payload: commentEncoded }],
      });

      setStatus("verifying");
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "An error occurred.";
      // Suppress TON Connect SDK cancellation errors — user chose not to connect,
      // don't leak raw SDK errors onto the page.
      if (rawMessage.includes("Wallet was not connected")) {
        setStatus("idle");
        return;
      }
      // Log wallet rejection as failed payment attempt
      if (orderId) {
        try {
          await fetch("/api/ton/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          });
        } catch {
          // ignore logging errors
        }
      }
      // Map common SDK errors to user-friendly copy in sentence case.
      let message: string;
      if (rawMessage.includes("Transaction was not sent")) {
        message = "Transaction was not sent. Try again.";
      } else if (
        rawMessage.includes("rejects the action") ||
        rawMessage.includes("Reject Request") ||
        rawMessage.includes("user rejected")
      ) {
        message = "Reject Request";
      } else {
        // Strip raw SDK error prefix and codes, keep only the user-facing part.
        message = rawMessage
          .replace(/^\[TON_CONNECT_SDK_ERROR\]\s*/i, "")
          .replace(/^[A-Za-z0-9]+\s*:\s*/, "")
          .trim() || "An error occurred.";
      }
      setErrorMessage(message);
      setStatus("idle");
}
  };

  const buttonClass = cn(
    "micro-transition min-h-11 relative items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    compact ? "inline-flex size-10 px-2 min-h-10" : "flex gap-2 flex-shrink-0 min-w-[128px]",
  );

  return (
    <div className="relative">
      {errorMessage && !compact && (
        <p className="absolute -top-[22px] left-0 w-full text-xs leading-relaxed text-destructive text-center">
          {errorMessage}
        </p>
      )}
      <button
        onClick={handlePay}
        disabled={isBusy}
        className={cn(
          buttonClass,
          "bg-primary text-primary-foreground hover:bg-primary/90",
          className,
        )}
      >
        {isBusy ? (
          <>
            <span className="opacity-0">
              <Plus aria-hidden className="size-4" />
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 aria-hidden className="size-4 motion-safe:animate-spin" />
            </div>
            {!compact && <span className="opacity-0">Pay 5 Gram</span>}
          </>
        ) : compact ? (
          <Plus aria-hidden className="size-4" />
        ) : (
          <>
            <Plus aria-hidden className="size-4" />
            Pay 5 Gram
          </>
        )}
      </button>
    </div>
  );
}
