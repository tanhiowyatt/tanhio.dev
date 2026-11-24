import type { Metadata } from "next";
import type { BlogLocale } from "@/lib/blog-posts";
import { getLocalizedPosts } from "@/lib/blog-posts";
import { blogSectionConfig } from "@/config/blog";
import { siteConfig } from "@/config/site";
import { BlogContent } from "./blog-content";
import { Footer } from "@/components/landing/footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `${siteConfig.meta.url}/${locale}/blog`;
  return {
    title: "blog",
    description: blogSectionConfig.description,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteConfig.meta.url}/en/blog`,
        ru: `${siteConfig.meta.url}/ru/blog`,
        pl: `${siteConfig.meta.url}/pl/blog`,
      },
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = await getLocalizedPosts(locale as BlogLocale);

  return (
    <>
      <BlogContent posts={posts} locale={locale} />
      <Footer />
    </>
  );
}
