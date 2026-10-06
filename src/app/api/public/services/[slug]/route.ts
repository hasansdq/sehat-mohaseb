import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const service = await db.service.findUnique({ where: { slug } });
  if (!service) return fail("خدمت یافت نشد.", 404);
  return ok({ service });
}
