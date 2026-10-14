import { NextRequest } from "next/server";
import { getAllSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { ok } from "@/lib/api";

export async function GET() {
  const settings = await getAllSettings();
  // CRITICAL: strip ALL sensitive keys — anything containing api keys, passwords,
  // admin credentials, or internal config must NEVER be exposed publicly.
  const safe: Record<string, string> = {};
  for (const [k, v] of Object.entries(settings)) {
    // Block known sensitive groups
    if (k.startsWith("admin.") || k.startsWith("backup.") || k.startsWith("security.")) continue;
    // Block AI system prompt (internal)
    if (k === "ai.systemPrompt") continue;
    // Block ALL openai.* keys (contains apiKey!)
    if (k.startsWith("openai.")) continue;
    safe[k] = v;
  }
  const services = await db.service.findMany({ where: { featured: true }, orderBy: { order: "asc" }, take: 8 });
  return ok({ settings: safe, services });
}
