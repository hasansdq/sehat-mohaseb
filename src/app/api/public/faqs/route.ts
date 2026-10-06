import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export async function GET() {
  const items = await db.faq.findMany({ orderBy: { order: "asc" } });
  return ok({ items });
}
