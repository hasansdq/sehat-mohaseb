import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { normalizeMobile, isValidMobile, isValidPassword, signAccessToken, verifyPassword } from "@/lib/auth";
import { ok, fail, getClientIp, getUserAgent, logActivity, getAuthContext } from "@/lib/api";
import { setAccessCookie } from "@/lib/cookies";
import { rateLimit, rlKey, reqIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // ---- Rate limit: 10 login attempts per IP per 15 minutes ----
    const ip = reqIp(req);
    const rl = rateLimit({ key: rlKey(ip, "auth:login"), maxRequests: 10, windowMs: 15 * 60 * 1000 });
    if (!rl.allowed) {
      const mins = Math.ceil((rl.resetAt - Date.now()) / 60000);
      return fail(`تلاش‌های ورود بیش از حد. ${mins} دقیقه بعد تلاش کنید.`, 429);
    }

    const body = await req.json().catch(() => ({}));
    const mobile = normalizeMobile(body.mobile ?? "");
    const password = body.password ?? "";

    if (!isValidMobile(mobile)) return fail("شماره موبایل نامعتبر است.", 422);
    if (!isValidPassword(password)) return fail("رمز عبور نامعتبر است.", 422);

    const user = await db.user.findUnique({ where: { mobile } });
    if (!user) return fail("شماره موبایل یا رمز عبور اشتباه است.", 401);
    if (user.status === "SUSPENDED") return fail("حساب شما مسدود شده است.", 403);

    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) {
      await logActivity({ actor: mobile, action: "login_failed", ip: getClientIp(req), userAgent: getUserAgent(req), meta: { reason: "wrong_password" } });
      return fail("شماره موبایل یا رمز عبور اشتباه است.", 401);
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: getClientIp(req) },
    });

    const token = signAccessToken({ sub: user.id, mobile: user.mobile, role: user.role });
    await setAccessCookie(token);
    await logActivity({ userId: user.id, actor: mobile, action: "login_success", ip: getClientIp(req), userAgent: getUserAgent(req) });

    return ok({
      user: { id: user.id, mobile: user.mobile, fullName: user.fullName, role: user.role, email: user.email },
      token,
    });
  } catch (e: any) {
    return fail("خطا در ورود.", 500, { detail: e?.message });
  }
}

export async function GET(req: NextRequest) {
  const ctx = await getAuthContext(req);
  if (!ctx.user) return ok({ user: null });
  return ok({ user: ctx.user });
}
