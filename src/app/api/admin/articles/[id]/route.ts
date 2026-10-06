import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  const article = await db.article.findUnique({ where: { id } });
  if (!article) return fail("یافت نشد.", 404);
  return ok({ article });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) return fail("یافت نشد.", 404);
  const data: any = {};
  for (const k of ["title", "slug", "excerpt", "content", "coverUrl", "category", "tags", "authorName", "seoTitle", "seoDescription", "readingMinutes"]) {
    if (body[k] !== undefined) data[k] = body[k] === null ? null : String(body[k]);
  }
  if (body.status !== undefined) {
    const next = body.status === "PUBLISHED" ? "PUBLISHED" : body.status === "ARCHIVED" ? "ARCHIVED" : "DRAFT";
    data.status = next;
    if (next === "PUBLISHED" && !existing.publishedAt) data.publishedAt = new Date();
  }
  if (body.featured !== undefined) data.featured = !!body.featured;
  if (data.slug && data.slug !== existing.slug) {
    const dup = await db.article.findFirst({ where: { slug: data.slug, NOT: { id } } });
    if (dup) data.slug = `${data.slug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  const updated = await db.article.update({ where: { id }, data });
  await logActivity({ actor: "admin", action: "article_update", target: id, ip: getClientIp(req) });
  return ok({ article: updated });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  await db.article.delete({ where: { id } }).catch(() => null);
  await logActivity({ actor: "admin", action: "article_delete", target: id, ip: getClientIp(req) });
  return ok({ done: true });
}
