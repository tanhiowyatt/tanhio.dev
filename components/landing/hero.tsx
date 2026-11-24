"use client";

import Image from "next/image";
import { VerseText } from "@/components/verse-text";
import { heroConfig } from "@/config/hero";
import { siteConfig } from "@/config/site";
import { MOTION_EASE } from "@/lib/motion";
import { motion, type Variants } from "motion/react";
import { InteractiveSticker } from "./interactive-sticker";
import { type CSSProperties, useEffect, useState } from "react";

// Keep blur on the text itself, so the banner and section shell stay sharp.
const textVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(3px)",
    y: 8
  },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: MOTION_EASE,
      delay,
      opacity: { duration: 0.28, ease: MOTION_EASE, delay },
    },
  }),
};

const locationTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: siteConfig.personal.location.timeZone,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function LocationTime() {
  const [showTime, setShowTime] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(locationTimeFormatter.format(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span
      onMouseEnter={() => setShowTime(true)}
      onMouseLeave={() => setShowTime(false)}
      className="inline-block min-w-[180px] text-sm font-mono text-muted-foreground"
      title={siteConfig.personal.location.timeLabel}
    >
      {showTime ? time : siteConfig.personal.location.label}
    </span>
  );
}

export function Hero() {
  return (
    <motion.section
      className="relative z-20 px-6 pt-4"
      initial="hidden"
      animate="visible"
    >
      {/* Hero banner GIF */}
      <Image
        src="/images/hero-banner.gif"
        alt="Hero banner"
        className="w-full h-56 object-cover rounded-xl border border-border/50"
        width={1200}
        height={400}
        unoptimized
        priority
      />

      {/* Portrait overlapping the banner (half on, half off) + nickname */}
      <div className="mt-4 sm:mt-6 relative z-10 w-full">
        <div className="flex sm:flex-row flex-col items-start gap-6 sm:gap-8 min-w-0">
          <div className="w-[64px] sm:w-[112px] shrink-0">
            <InteractiveSticker
              src={siteConfig.personal.avatar.src}
              alt={siteConfig.personal.avatar.alt}
              label="Profile picture"
              tilt={-5}
              sizes="(max-width: 640px) 64px, 112px"
              soundSrc="/profile-pop.mp3"
              className="aspect-square w-full rounded-xl ring-1 ring-inset ring-border"
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-2 sm:gap-3">
            <div className="flex items-baseline min-w-0">
              <VerseText
                text="tanhiowyatt"
                className="font-serif text-2xl sm:text-3xl mr-2 sm:mr-3"
                style={{
                  "--vt-ink": "var(--foreground)",
                  "--vt-blend": "var(--verse-text-blend, multiply)",
                  "--vt-leading": "inherit",
} as CSSProperties }
              />
              <motion.span
                data-reveal=""
                variants={textVariants}
                className="no-js-visible inline-block"
              >
                <span className="inline-block text-xl mr-[25px] relative top-[1px]" style={{ transformOrigin: "70% 70%" }}>
                  {typeof heroConfig.waveEmoji === "string" ? (
                    heroConfig.waveEmoji
                  ) : (
                    <heroConfig.waveEmoji className="fill-current" />
                  )}
                </span>
              </motion.span>
              <span className="self-center w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              <span className="ml-[25px]"><LocationTime /></span>
            </div>
            <motion.h1
              data-reveal=""
              className="no-js-visible text-xs sm:text-sm md:text-base font-semibold leading-[1.05] tracking-tight text-balance"
              variants={textVariants}
              custom={0.1}
            >
              I build security in public.
            </motion.h1>

            <motion.p
              data-reveal=""
              className="no-js-visible text-xs text-muted-foreground"
              variants={textVariants}
              custom={0.18}
            >
              I&apos;m Security Engineer with a focus on application and infrastructure penetration testing.
            </motion.p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
