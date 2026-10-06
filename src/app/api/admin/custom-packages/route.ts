import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, requireAdmin } from "@/lib/api";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const where: any = {};
  if (status) where.status = status;
  const items = await db.customPackageRequest.findMany({ where, orderBy: { createdAt: "desc" } });
  return ok({ items });
}
