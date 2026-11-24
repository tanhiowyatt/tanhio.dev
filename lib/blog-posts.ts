import { readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { type BlogPost, getEnabledPosts } from "@/config/blog";

export type BlogLocale = "en" | "ru" | "pl";

export const blogLocales: BlogLocale[] = ["en", "ru", "pl"];

export const blogLocaleCookie = "tanhio-language";

export function parseBlogLocale(value: string | undefined): BlogLocale {
  if (value && blogLocales.includes(value as BlogLocale)) {
    return value as BlogLocale;
  }
  return "en";
}

export function postMdxPath(id: string, locale: BlogLocale): string {
  return path.join(process.cwd(), "content/blog", locale, `${id}.mdx`);
}

export async function getPostSource(id: string, locale: BlogLocale): Promise<string> {
  return readFile(postMdxPath(id, locale), "utf8");
}

export function parsePostFrontmatter(content: string): Record<string, unknown> {
  return matter(content).data;
}

export function parsePost(content: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const parsed = matter(content);
  return { data: parsed.data, body: parsed.content };
}

export async function getLocalizedPosts(locale: BlogLocale): Promise<BlogPost[]> {
  const posts = [...getEnabledPosts()].sort((a, b) => a.order - b.order);
  if (locale === "en") return posts;

  const localized: BlogPost[] = [];
  for (const post of posts) {
    try {
      const content = await getPostSource(post.id, locale);
      const data = matter(content).data;
      localized.push({
        ...post,
        title: (typeof data.title === "string" ? data.title : post.title),
        excerpt: (typeof data.excerpt === "string" ? data.excerpt : post.excerpt),
        category: (typeof data.category === "string" ? data.category : post.category) as BlogPost["category"],
      });
    } catch {
      localized.push(post);
    }
  }
  return localized;
}
