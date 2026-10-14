import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export async function GET() {
  const items = await db.navItem.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
  return ok({ items });
}
