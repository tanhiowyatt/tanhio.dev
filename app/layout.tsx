import { BottomNav } from "@/components/landing/bottom-nav";
import { BackToTop } from "@/components/shared/back-to-top";
import { FrameGutters } from "@/components/shared/frame-gutters";
import { GlobalClickSound } from "@/components/shared/global-click-sound";
import { PixelDissolve } from "@/components/ui/pixel-dissolve";
import { PostHogProvider } from "@/components/shared/posthog-provider";
import { SiteHeader } from "@/components/shared/site-header";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cookies } from "next/headers";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { parseBlogLocale } from "@/lib/blog-posts";
import { Analytics } from "@vercel/analytics/next";
import { Metadata, Viewport } from "next";
import { DM_Sans, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

const DmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.meta.url),
  title: {
    default: siteConfig.meta.title,
    template: siteConfig.meta.titleTemplate,
  },
  description: siteConfig.meta.description,
  keywords: siteConfig.meta.keywords,
  authors: siteConfig.meta.authors,
  creator: siteConfig.meta.creator,
  publisher: siteConfig.meta.publisher,
  classification: siteConfig.meta.classification,
  category: siteConfig.meta.category,
  alternates: {
    canonical: siteConfig.meta.url,
  },
  openGraph: {
    type: "website",
    locale: siteConfig.meta.locale,
    url: siteConfig.meta.url,
    title: siteConfig.meta.title,
    description: siteConfig.meta.description,
    siteName: siteConfig.meta.shortTitle,
    images: [siteConfig.meta.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.meta.title,
    description: siteConfig.meta.description,
    images: [siteConfig.meta.ogImage.url],
    creator: siteConfig.meta.twitterCreator,
  },
  icons: {
    icon: siteConfig.meta.icon,
    shortcut: siteConfig.meta.icon,
    apple: siteConfig.meta.appleIcon,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: siteConfig.meta.googleVerification || undefined,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.meta.url}/#website`,
      url: siteConfig.meta.url,
      name: siteConfig.meta.title,
      description: siteConfig.meta.description,
      publisher: {
        "@id": `${siteConfig.meta.url}/#person`,
      },
    },
    {
      "@type": "Person",
      "@id": `${siteConfig.meta.url}/#person`,
      name: siteConfig.personal.fullName,
      url: siteConfig.meta.url,
      jobTitle: "Security Engineer",
      description: siteConfig.meta.description,
      knowsAbout: [
        "Next.js",
        "TypeScript",
        "React",
        "Prisma",
        "Tailwind CSS",
        "Node.js",
        "PostgreSQL",
        "AWS",
      ],
      sameAs: [
        "https://github.com/tanhiowyatt",
        "https://x.com/tanhiowyatt",
        "https://linkedin.com/in/tanhiowyatt",
      ],
      image: siteConfig.personal.avatar.src,
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await cookies();
  const lang = parseBlogLocale(store.get("tanhio-language")?.value);

  return (
    <html
      lang={lang}
      className={cn(
        "bg-background font-sans",
        DmSans.variable,
        instrumentSerif.variable,
      )}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link
          rel="stylesheet"
          href="https://cdn.tonconnect.org/ui/v2/tonconnect-ui.min.css"
        />
      </head>
      <body
        className={`${geistMono.variable} antialiased`}
      >
        <noscript>
          <style>{`.no-js-visible { opacity: 1 !important; transform: none !important; filter: none !important; stroke-dashoffset: 0 !important; stroke-dasharray: none !important; }`}</style>
        </noscript>
        <ThemeProvider>
          <TooltipProvider>
            <PostHogProvider>
              <SiteHeader />
              <GlobalClickSound />
              <FrameGutters />
              <div className="relative mx-auto w-full max-w-[var(--frame-max-w)]">
                <div className="relative w-full border-x bg-muted/20">
                  {children}
                </div>
                <BottomNav />
                <BackToTop />
                <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-[var(--frame-max-w)]">
                  <div aria-hidden="true" className="bottom-blur" />
                  <PixelDissolve />
                </div>
              </div>
            </PostHogProvider>
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
