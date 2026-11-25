"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import type { ReactNode } from "react";

/**
 * Wraps any section that uses {@link TonPayButton} with this provider.
 * Manifest URL is consistent between server and client so TON Connect SDK
 * doesn't treat them as different dApps and drop the connection on hydration.
 */
export function TonConnectProvider({ children }: { children: ReactNode }) {
  const manifestUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/tonconnect-manifest.json"
      : "https://tanhio.dev/tonconnect-manifest.json";

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>{children}</TonConnectUIProvider>
  );
}
