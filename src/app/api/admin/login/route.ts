import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, signAdminAccessToken, isValidPassword } from "@/lib/auth";
import { ok, fail, getClientIp, getUserAgent, logActivity } from "@/lib/api";
import { setAdminCookie, clearAdminCookie } from "@/lib/cookies";
import { getSetting, setSetting } from "@/lib/settings";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = (body.username ?? "").toString().trim();
    const password = (body.password ?? "").toString();

    if (!username || !isValidPassword(password)) {
      return fail("نام کاربری و رمز عبور را درست وارد کنید.", 422);
    }

    const ip = getClientIp(req);
    const ua = getUserAgent(req);

    // Lock check
    const lockUntilStr = await getSetting("admin.lockedUntil");
    if (lockUntilStr) {
      const lockUntil = new Date(lockUntilStr);
      if (lockUntil.getTime() > Date.now()) {
        const mins = Math.ceil((lockUntil.getTime() - Date.now()) / 60000);
        return fail(`به دلیل تلاش‌های ناموفق، ورود تا ${mins} دقیقه دیگر قفل است.`, 423);
      }
    }

    const storedUsername = await getSetting("admin.username");
    const storedHash = await getSetting("admin.passwordHash");

    if (username !== storedUsername || !storedHash || !verifyPassword(password, storedHash)) {
      const attemptsStr = await getSetting("admin.loginAttempts");
      const attempts = Number(attemptsStr || "0") + 1;
      if (attempts >= MAX_ATTEMPTS) {
        const until = new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString();
        await setSetting("admin.lockedUntil", until, "general");
        await setSetting("admin.loginAttempts", "0", "general");
        await logActivity({ actor: username, action: "admin_login_locked", ip, userAgent: ua, meta: { attempts } });
        return fail(`تعداد تلاش‌ها بیش از حد مجاز بود. ورود تا ${LOCK_MINUTES} دقیقه قفل شد.`, 423);
      }
      await setSetting("admin.loginAttempts", String(attempts), "general");
      await logActivity({ actor: username, action: "admin_login_failed", ip, userAgent: ua, meta: { attempts } });
      return fail(`نام کاربری یا رمز عبور اشتباه است. (${MAX_ATTEMPTS - attempts} تلاش باقی‌مانده)`, 401);
    }

    // success: reset
    await setSetting("admin.loginAttempts", "0", "general");
    await setSetting("admin.lockedUntil", "", "general");
    await setSetting("admin.lastLoginAt", new Date().toISOString(), "general");
    await setSetting("admin.lastLoginIp", ip, "general");

    const token = signAdminAccessToken({ sub: "admin", username, role: "ADMIN" });
    await setAdminCookie(token);
    await logActivity({ actor: username, action: "admin_login_success", ip, userAgent: ua });

    return ok({ admin: { username, displayName: await getSetting("admin.displayName") } });
  } catch (e: any) {
    return fail("خطا در ورود به پنل مدیریت.", 500, { detail: e?.message });
  }
}

export async function DELETE(req: NextRequest) {
  await clearAdminCookie();
  return ok({ done: true });
}
