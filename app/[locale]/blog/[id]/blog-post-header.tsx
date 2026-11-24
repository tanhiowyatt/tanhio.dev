"use client";

import { motion } from "motion/react";
import { reveal } from "@/lib/motion";

interface BlogPostHeaderProps {
  date: string;
  category: string;
  title: string;
  excerpt: string;
}

export function BlogPostHeader({ date, category, title, excerpt }: BlogPostHeaderProps) {
  return (
    <header className="mb-8">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        {date} · {category}
      </div>
      <motion.h1 {...reveal({ y: 8 })} className="no-js-visible text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
        {title}
      </motion.h1>
      <motion.p {...reveal({ y: 8, delay: 0.1 })} className="no-js-visible mt-4 text-sm leading-relaxed text-muted-foreground">
        {excerpt}
      </motion.p>
    </header>
  );
}
