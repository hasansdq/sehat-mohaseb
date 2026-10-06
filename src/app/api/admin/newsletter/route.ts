import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, requireAdmin } from "@/lib/api";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const items = await db.newsletter.findMany({ orderBy: { createdAt: "desc" } });
  return ok({ items });
}
