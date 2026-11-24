"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

import { blogSectionConfig, type BlogPost } from "@/config/blog";
import { reveal } from "@/lib/motion";

const pageTurnAudio =
  typeof window !== "undefined"
    ? new Audio("/notebook-page-turn.mp3")
    : null;

export function BlogContent({ posts, locale }: { posts: BlogPost[]; locale: string }) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-x-clip border-x bg-background pt-16">
      <section className="border-t border-dashed pt-4">
        <p className="px-6 pb-4 text-xs">Blog</p>
        <motion.h1 {...reveal({ y: 8 })} className="no-js-visible section-heading">
          {blogSectionConfig.title}
        </motion.h1>
        <motion.p
          {...reveal({ y: 8, delay: 0.1 })}
          className="no-js-visible px-6 mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground"
        >
          {blogSectionConfig.description}
        </motion.p>
      </section>

      <section className="border-t border-dashed pt-8 pb-20">
        <ul className="space-y-3 px-6" role="list">
          {posts.map((post, index) => (
            <motion.li
              key={post.id}
              {...reveal({ y: 8, delay: index * 0.08 })}
              className="no-js-visible"
            >
              <Link
                href={`/${locale}/blog/${post.id}`}
                data-sound-ignore
                onClick={() => pageTurnAudio?.play().catch(() => {})}
                className="group flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between rounded-xl border border-dashed border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
                {post.image ? (
                  <div className="relative shrink-0 rounded-lg border border-border">
                    <Image
                      src={post.image.replace("/images/blog/", `/images/blog/${locale}/`)}
                      alt={post.title}
                      width={400}
                      height={300}
                      className="w-full object-contain rounded-lg sm:max-w-[180px] sm:max-h-[135px]"
                      sizes="(max-width: 640px) 100vw, 180px"
                    />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                    {post.date}
                  </div>
                  <h2 className="mt-1 truncate text-base font-medium tracking-tight text-foreground">
                    {post.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                </div>
                <ArrowRight className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground sm:mt-0" />
              </Link>
            </motion.li>
          ))}
        </ul>
      </section>
    </main>
  );
}
