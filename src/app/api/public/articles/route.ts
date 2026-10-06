import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const limit = Number(url.searchParams.get("limit") || 12);
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

  const where: any = { status: "PUBLISHED" };
  if (category) where.category = category;
  const items = await db.article.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: { id: true, slug: true, title: true, excerpt: true, coverUrl: true, category: true, publishedAt: true, readingMinutes: true, featured: true },
  });
  return ok({ items });
}
