import { NextRequest } from "next/server";
import { getSettings, setSettings } from "@/lib/settings";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

const AI_KEYS = [
  "ai.enabled", "ai.model", "ai.temperature", "ai.maxTokens",
  "ai.systemPrompt", "ai.greeting", "ai.enablePackageBuilder", "ai.enableConsultation",
];

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const settings = await getSettings(AI_KEYS);
  return ok({ settings });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const items: Record<string, { value: string; group?: string }> = {};
  for (const k of AI_KEYS) {
    if (body[k] !== undefined) {
      let v = body[k];
      if (typeof v === "boolean") v = v ? "true" : "false";
      else v = String(v);
      items[k] = { value: v, group: "ai" };
    }
  }
  if (Object.keys(items).length) await setSettings(items);
  await logActivity({ actor: "admin", action: "ai_settings_update", ip: getClientIp(req), meta: { keys: Object.keys(items) } });
  return ok({ done: true });
}
