import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const status = url.searchParams.get("status");
  const where: any = {};
  if (status) where.status = status;
  if (q) where.title = { contains: q };
  const items = await db.article.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, slug: true, title: true, excerpt: true, status: true, category: true, views: true, featured: true, createdAt: true, publishedAt: true, coverUrl: true },
  });
  return ok({ items });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = (body.title ?? "").toString().trim();
  if (!title) return fail("عنوان الزامی است.", 422);
  const slug = (body.slug ?? slugify(title)).toString().trim() || slugify(title);
  const existing = await db.article.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Math.random().toString(36).slice(2, 6)}` : slug;
  const created = await db.article.create({
    data: {
      title,
      slug: finalSlug,
      excerpt: body.excerpt || null,
      content: body.content || "",
      coverUrl: body.coverUrl || null,
      category: body.category || null,
      tags: body.tags || null,
      authorName: body.authorName || null,
      status: body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      featured: !!body.featured,
      readingMinutes: body.readingMinutes ? Number(body.readingMinutes) : null,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      publishedAt: body.status === "PUBLISHED" ? new Date() : null,
    },
  });
  await logActivity({ actor: "admin", action: "article_create", target: created.id, ip: getClientIp(req), meta: { title } });
  return ok({ article: created });
}

function slugify(s: string) {
  return s.trim().replace(/\s+/g, "-").replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "").slice(0, 60) || `post-${Date.now()}`;
}
