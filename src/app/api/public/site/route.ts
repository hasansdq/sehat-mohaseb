import { NextRequest } from "next/server";
import { getAllSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export async function GET() {
  const settings = await getAllSettings();
  // strip sensitive keys for public
  const safe: Record<string, string> = {};
  for (const [k, v] of Object.entries(settings)) {
    if (k.startsWith("admin.") || k.startsWith("backup.") || k.startsWith("security.") || k === "ai.systemPrompt") continue;
    safe[k] = v;
  }
  // attach nav-relevant public pieces in one call
  const services = await db.service.findMany({ where: { featured: true }, orderBy: { order: "asc" }, take: 8 });
  return ok({ settings: safe, services });
}
