import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, requireUser } from "@/lib/api";

export async function GET(req: NextRequest) {
  const user = await requireUser(req);
  if (!user) return Response.json({ ok: false, error: "نشست یافت نشد" }, { status: 401 });
  const items = await db.consultationRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return ok({ items });
}
