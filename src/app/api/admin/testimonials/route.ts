import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const items = await db.testimonial.findMany({ orderBy: { order: "asc" } });
  return ok({ items });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = (body.name ?? "").toString().trim();
  if (!name) return fail("نام الزامی است.", 422);
  const created = await db.testimonial.create({
    data: {
      name, company: body.company || null, role: body.role || null,
      message: body.message || "", rating: Math.min(Math.max(Number(body.rating || 5), 1), 5),
      avatarUrl: body.avatarUrl || null, order: Number(body.order || 0),
    },
  });
  await logActivity({ actor: "admin", action: "testimonial_create", target: created.id, ip: getClientIp(req) });
  return ok({ testimonial: created });
}
