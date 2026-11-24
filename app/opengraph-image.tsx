import { openGraphConfig } from "@/config/opengraph";
import { siteConfig } from "@/config/site";
import { Location01Icon } from "@hugeicons/core-free-icons";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createElement } from "react";

export const runtime = "nodejs";
export const alt = `${siteConfig.personal.fullName}, ${openGraphConfig.locationLabel}, framed by a paper-cut flower garden`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SERIF = "Geist Serif";
const SANS = "Geist";
const { colors } = openGraphConfig;
const [font, locationFont] = await Promise.all([
  readFile(path.join(process.cwd(), "lib/fonts/GeistSerif-Regular.ttf")),
  readFile(path.join(process.cwd(), "lib/fonts/Geist-Regular.ttf")),
  ]);

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          backgroundColor: colors.background,
          color: colors.foreground,
          fontFamily: SERIF,
        }}
      >
        <div
          style={{
            display: "flex",
            position: "relative",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 112,
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: -2,
            }}
          >
            {siteConfig.personal.fullName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 18,
              color: colors.mutedForeground,
              fontFamily: SANS,
              fontSize: 24,
              lineHeight: 1.2,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              {Location01Icon.map(([tag, { key, ...attributes }]) =>
                createElement(tag, { ...attributes, key }),
              )}
            </svg>
            {openGraphConfig.locationLabel}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: SERIF, data: font, style: "normal", weight: 400 },
        { name: SANS, data: locationFont, style: "normal", weight: 400 },
      ],
    },
  );
}
