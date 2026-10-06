import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const items = await db.service.findMany({ orderBy: { order: "asc" } });
  return ok({ items });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const title = (body.title ?? "").toString().trim();
  if (!title) return fail("عنوان الزامی است.", 422);
  const slug = (body.slug ?? title.trim().replace(/\s+/g, "-")).toString();
  const existing = await db.service.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Math.random().toString(36).slice(2, 5)}` : slug;
  const created = await db.service.create({
    data: {
      title, slug: finalSlug,
      shortDesc: body.shortDesc || null,
      description: body.description || null,
      icon: body.icon || null,
      image: body.image || null,
      order: Number(body.order || 0),
      featured: !!body.featured,
      priceLabel: body.priceLabel || null,
    },
  });
  await logActivity({ actor: "admin", action: "service_create", target: created.id, ip: getClientIp(req) });
  return ok({ service: created });
}
