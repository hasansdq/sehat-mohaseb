import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, getAuthContext } from "@/lib/api";

export async function GET(req: NextRequest) {
  const ctx = await getAuthContext(req);
  if (!ctx.user) return ok({ items: [] });
  const items = await db.aiConversation.findMany({
    where: { userId: ctx.user.id },
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });
  return ok({ items });
}
