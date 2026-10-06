import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const items = await db.businessPackage.findMany({ orderBy: { order: "asc" } });
  return ok({ items });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = (body.name ?? "").toString().trim();
  if (!name) return fail("نام پک الزامی است.", 422);
  const slug = (body.slug ?? name.trim().replace(/\s+/g, "-")).toString();
  const existing = await db.businessPackage.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Math.random().toString(36).slice(2, 5)}` : slug;
  const created = await db.businessPackage.create({
    data: {
      name, slug: finalSlug,
      software: body.software || null,
      category: body.category || null,
      shortDesc: body.shortDesc || null,
      description: body.description || null,
      features: body.features || null,
      price: body.price != null && body.price !== "" ? Number(body.price) : null,
      oldPrice: body.oldPrice != null && body.oldPrice !== "" ? Number(body.oldPrice) : null,
      badge: body.badge || null,
      popular: !!body.popular,
      order: Number(body.order || 0),
      icon: body.icon || null,
    },
  });
  await logActivity({ actor: "admin", action: "package_create", target: created.id, ip: getClientIp(req) });
  return ok({ package: created });
}
