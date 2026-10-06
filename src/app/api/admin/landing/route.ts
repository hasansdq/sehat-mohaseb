import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const items = await db.landingBlock.findMany({ orderBy: [{ section: "asc" }, { order: "asc" }] });
  return ok({ items });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  // body.items: [{ section, key, value, order }]
  const items = Array.isArray(body.items) ? body.items : [body];
  for (const it of items) {
    if (!it.section || !it.key) continue;
    await db.landingBlock.upsert({
      where: { section_key: { section: it.section, key: it.key } },
      update: { value: String(it.value ?? ""), order: Number(it.order || 0) },
      create: { section: it.section, key: it.key, value: String(it.value ?? ""), order: Number(it.order || 0) },
    });
  }
  await logActivity({ actor: "admin", action: "landing_update", ip: getClientIp(req), meta: { count: items.length } });
  return ok({ done: true });
}
