import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownAsync } from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { markdownComponents } from "@/lib/markdown/markdown-components";
import { getEnabledPosts } from "@/config/blog";
import { siteConfig } from "@/config/site";
import {
  getLocalizedPosts,
  getPostSource,
  parsePost,
} from "@/lib/blog-posts";
import type { BlogLocale } from "@/lib/blog-posts";
import { BlogPostHeader } from "./blog-post-header";
import { Footer } from "@/components/landing/footer";

export async function generateStaticParams() {
  const locales: BlogLocale[] = ["en", "ru", "pl"];
  return locales.flatMap((locale) =>
    getEnabledPosts().map((post) => ({ locale, id: post.id })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const post = (await getLocalizedPosts(locale as BlogLocale)).find(
    (p) => p.id === id,
  );

  if (!post) {
    return { title: "Post Not Found" };
  }

  const url = `${siteConfig.meta.url}/${locale}/blog/${post.id}`;
  return {
    title: { default: post.title, template: "%s" },
    description: post.excerpt,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteConfig.meta.url}/en/blog/${post.id}`,
        ru: `${siteConfig.meta.url}/ru/blog/${post.id}`,
        pl: `${siteConfig.meta.url}/pl/blog/${post.id}`,
      },
    },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      siteName: siteConfig.meta.shortTitle,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const posts = await getLocalizedPosts(locale as BlogLocale);
  const index = posts.findIndex((p) => p.id === id);
  const post = posts[index];

  if (!post) {
    notFound();
  }

  let md = "";
  try {
    md = await getPostSource(post.id, locale as BlogLocale);
  } catch {
    notFound();
  }

  const { data, body } = parsePost(md);
  const title = typeof data.title === "string" ? data.title : post.title;
  const excerpt = typeof data.excerpt === "string" ? data.excerpt : post.excerpt;

  const rendered = await MarkdownAsync({
    remarkPlugins: [remarkGfm],
    components: markdownComponents,
    children: body,
  });

  const prev = index > 0 ? posts[index - 1] : undefined;
  const next = index < posts.length - 1 ? posts[index + 1] : undefined;

  return (
    <>
    <main className="relative flex min-h-dvh flex-col overflow-x-clip border-x bg-background pt-16">
      <article className="mx-auto w-full max-w-3xl px-6 pt-4 pb-8 border-t border-dashed">
        <BlogPostHeader
          date={post.date}
          category={post.category}
          title={title}
          excerpt={excerpt}
        />
        <div className="prose mt-8 max-w-none text-foreground">
          {rendered}
        </div>

        {(prev || next) && (
          <nav className="mt-12 flex items-center justify-between gap-4 border-t border-dashed border-border pt-6">
            {prev ? (
              <Link
                href={`/${locale}/blog/${prev.id}`}
                className="group flex min-w-0 max-w-[48%] items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                <span className="min-w-0 truncate">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/${locale}/blog/${next.id}`}
                className="group flex min-w-0 max-w-[48%] items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="min-w-0 truncate">{next.title}</span>
                <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </article>
    </main>
    <Footer />
    </>
  );
}
