import { z } from "zod";
import { NextRequest } from "next/server";
import { getAllSettings, setSettings, setSetting, getSettingsByGroup } from "@/lib/settings";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";
import { hashPassword, verifyPassword, MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const url = new URL(req.url);
  const group = url.searchParams.get("group");
  let settings: Record<string, string>;
  if (group) {
    settings = await getSettingsByGroup(group);
  } else {
    settings = await getAllSettings();
  }
  // mask sensitive
  const safe = { ...settings };
  if (safe["admin.passwordHash"]) safe["admin.passwordHash"] = "••••••";
  return ok({ settings: safe });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  // body.items: { key: { value, group? } }
  const parsed = z.record(z.string().min(1).max(120), z.object({
    value: z.string().max(50000), group: z.string().max(80).optional(),
  })).safeParse(body?.items);
  if (!parsed.success || Object.keys(parsed.data).length > 200) return fail("داده نامعتبر.", 422);
  const items = parsed.data;
  if (items["blog.postsPerPage"] && !/^(?:[1-9]|[1-9][0-9]|100)$/.test(items["blog.postsPerPage"].value))
    return fail("تعداد مقالات باید عددی بین ۱ و ۱۰۰ باشد.", 422);

  // handle admin password change specially
  const filtered: Record<string, { value: string; group?: string }> = {};
  for (const [k, v] of Object.entries(items)) {
    if (k === "admin.passwordHash") {
      // ignore — handled below if newPassword provided
      continue;
    }
    filtered[k] = v;
  }
  if (Object.keys(filtered).length) await setSettings(filtered);
  await logActivity({ actor: "admin", action: "settings_update", ip: getClientIp(req), meta: { keys: Object.keys(filtered) } });
  return ok({ done: true });
}

// Change admin credentials
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const action = body.action;

  if (action === "changePassword") {
    const current = body.currentPassword;
    const newPw = body.newPassword;
    if (!newPw || String(newPw).length < MIN_ADMIN_PASSWORD_LENGTH) return fail("رمز جدید باید حداقل ۱۲ کاراکتر باشد.", 422);
    const storedHash = (await getAllSettings())["admin.passwordHash"];
    if (!storedHash || !verifyPassword(String(current), storedHash)) return fail("رمز فعلی اشتباه است.", 403);
    await setSetting("admin.passwordHash", hashPassword(String(newPw)), "general");
    await logActivity({ actor: "admin", action: "admin_password_change", ip: getClientIp(req) });
    return ok({ done: true });
  }

  if (action === "changeUsername") {
    const newUsername = (body.username ?? "").toString().trim();
    if (newUsername.length < 3) return fail("نام کاربری باید حداقل ۳ کاراکتر باشد.", 422);
    await setSetting("admin.username", newUsername, "general");
    await logActivity({ actor: "admin", action: "admin_username_change", ip: getClientIp(req), meta: { newUsername } });
    return ok({ done: true, username: newUsername });
  }

  return fail("عملیات نامعتبر.", 422);
}
