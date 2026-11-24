"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import type { ReactNode } from "react";

/**
 * Wraps any section that uses {@link TonPayButton} with this provider.
 * Manifest URL is hardcoded to the production domain so wallets running on
 * mobile devices can fetch it (localhost is not publicly accessible).
 */
export function TonConnectProvider({ children }: { children: ReactNode }) {
  const manifestUrl = "https://tanhio.dev/tonconnect-manifest.json";

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>{children}</TonConnectUIProvider>
  );
}
