import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export async function GET() {
  const items = await db.landingBlock.findMany({ orderBy: [{ section: "asc" }, { order: "asc" }] });
  return ok({ items });
}
