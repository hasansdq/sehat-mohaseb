import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const items = await db.faq.findMany({ orderBy: { order: "asc" } });
  return ok({ items });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const question = (body.question ?? "").toString().trim();
  if (!question) return fail("سوال الزامی است.", 422);
  const created = await db.faq.create({ data: { question, answer: body.answer || "", order: Number(body.order || 0) } });
  await logActivity({ actor: "admin", action: "faq_create", target: created.id, ip: getClientIp(req) });
  return ok({ faq: created });
}
