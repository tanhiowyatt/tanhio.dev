import { notFound } from "next/navigation";
import type { BlogLocale } from "@/lib/blog-posts";
import { blogLocales } from "@/lib/blog-posts";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!blogLocales.includes(locale as BlogLocale)) {
    notFound();
  }
  return <>{children}</>;
}
