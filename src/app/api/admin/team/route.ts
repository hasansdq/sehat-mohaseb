import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const items = await db.teamMember.findMany({ orderBy: { order: "asc" } });
  return ok({ items });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = (body.name ?? "").toString().trim();
  if (!name) return fail("نام الزامی است.", 422);
  const created = await db.teamMember.create({
    data: {
      name, role: body.role || "", bio: body.bio || null,
      photoUrl: body.photoUrl || null, linkedin: body.linkedin || null, email: body.email || null,
      order: Number(body.order || 0),
    },
  });
  await logActivity({ actor: "admin", action: "team_create", target: created.id, ip: getClientIp(req) });
  return ok({ member: created });
}
