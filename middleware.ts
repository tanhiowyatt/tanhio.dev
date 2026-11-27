import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Paths that should bypass bot protection:
 * - TON Connect manifest — needed by SDK for wallet connection
 * - PGP keys — user downloads
 * - TON payment API — create order, check status, claim seat, verify payment
 */
const BYPASS_PATHS = [
  "/tonconnect-manifest.json",
  "/key.asc",
  "/key-backup.asc",
  "/api/ton/payment/create",
  "/api/ton/payment/status",
  "/api/ton/claim",
  "/api/ton/verify",
];

function isBypassPath(pathname: string): boolean {
  if (BYPASS_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/api/ton/")) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isBypassPath(pathname)) {
    return NextResponse.next();
  }

  // Preflight CORS request (OPTIONS) — respond immediately without reaching API.
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key"
  );

  // Keys and manifest cached long — rarely change. API — never cached.
  if (pathname.startsWith("/api/ton/")) {
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
  } else {
    response.headers.set(
      "Cache-Control",
      "public, max-age=3600, immutable"
    );
    response.headers.set("X-Content-Type-Options", "nosniff");
  }

  response.headers.set("X-Bot-Bypass", "true");
  return response;
}

export const config = {
  matcher: [
    "/tonconnect-manifest.json",
    "/key.asc",
    "/key-backup.asc",
    "/api/ton/:path*",
  ],
};
