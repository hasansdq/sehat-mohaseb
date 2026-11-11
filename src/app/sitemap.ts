import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

// Native Next.js sitemap — uses the MetadataRoute.Sitemap format.
// Next.js automatically serves this at /sitemap.xml and handles the
// XML serialization. Revalidated every hour.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://sehatmohaseb.com";
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/packages`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/software/sepidar`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/software/dasht`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  // Dynamic article routes
  const articles = await db.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, publishedAt: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });
  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: a.updatedAt || a.publishedAt || now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Dynamic service routes
  const services = await db.service.findMany({ select: { slug: true, updatedAt: true } });
  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: s.updatedAt || now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...articleRoutes, ...serviceRoutes];
}
