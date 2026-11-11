import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const bounded = (value: string | null, fallback: number, max: number) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.min(max, Math.floor(n) || fallback) : fallback;
  };
  const limit = bounded(url.searchParams.get("limit"), 12, 100);
  const page = bounded(url.searchParams.get("page"), 1, 100000);
  const query = url.searchParams.get("q")?.trim().slice(0, 200);
  const category = url.searchParams.get("category");

  if (slug) {
    // CRITICAL: Only return PUBLISHED articles via public API.
    // Drafts and archived articles must NEVER be accessible by slug.
    const article = await db.article.findUnique({ where: { slug } });
    if (!article || article.status !== "PUBLISHED") {
      return Response.json({ ok: false, error: "یافت نشد." }, { status: 404 });
    }
    await db.article.update({ where: { id: article.id }, data: { views: { increment: 1 } } });
    return ok({ article });
  }

  const where: Prisma.ArticleWhereInput = { status: "PUBLISHED" };
  if (query) where.OR = [{ title: { contains: query } }, { excerpt: { contains: query } }];
  if (category) where.category = category;
  const total = await db.article.count({ where });
  const currentPage = Math.min(page, Math.max(1, Math.ceil(total / limit)));
  const categories = await db.article.findMany({
    where: { status: "PUBLISHED", category: { not: null } },
    distinct: ["category"], select: { category: true }, orderBy: { category: "asc" },
  });
  const items = await db.article.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    skip: (currentPage - 1) * limit,
    take: limit,
    select: { id: true, slug: true, title: true, excerpt: true, coverUrl: true, category: true, publishedAt: true, readingMinutes: true, featured: true },
  });
  return ok({ items, total, page: currentPage, categories: categories.map((item) => item.category).filter(Boolean) });
}

