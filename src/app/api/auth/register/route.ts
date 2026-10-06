import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, normalizeMobile, isValidMobile, isValidPassword, signAccessToken } from "@/lib/auth";
import { ok, fail, getClientIp, getUserAgent, logActivity } from "@/lib/api";
import { setAccessCookie } from "@/lib/cookies";
import { rateLimit, rlKey, reqIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // ---- Rate limit: 5 registrations per IP per hour ----
    const ip = reqIp(req);
    const rl = rateLimit({ key: rlKey(ip, "auth:register"), maxRequests: 5, windowMs: 60 * 60 * 1000 });
    if (!rl.allowed) {
      const mins = Math.ceil((rl.resetAt - Date.now()) / 60000);
      return fail(`تلاش‌های ثبت‌نام بیش از حد. ${mins} دقیقه بعد تلاش کنید.`, 429);
    }

    const body = await req.json().catch(() => ({}));
    const mobile = normalizeMobile(body.mobile ?? "");
    const password = body.password ?? "";
    const fullName = (body.fullName ?? "").toString().trim();
    const email = (body.email ?? "").toString().trim() || null;

    if (!isValidMobile(mobile)) return fail("شماره موبایل نامعتبر است.", 422);
    if (!isValidPassword(password)) return fail("رمز عبور باید حداقل ۶ کاراکتر باشد.", 422);

    const existing = await db.user.findUnique({ where: { mobile } });
    if (existing) return fail("این شماره موبایل قبلا ثبت شده است.", 409);

    const user = await db.user.create({
      data: {
        mobile,
        passwordHash: hashPassword(password),
        fullName: fullName || null,
        email,
        status: "ACTIVE",
        lastLoginAt: new Date(),
        lastLoginIp: getClientIp(req),
      },
      select: { id: true, mobile: true, fullName: true, role: true },
    });

    const token = signAccessToken({ sub: user.id, mobile: user.mobile, role: user.role });
    await setAccessCookie(token);
    await logActivity({ userId: user.id, actor: mobile, action: "register", ip: getClientIp(req), userAgent: getUserAgent(req) });
    return ok({ user, token });
  } catch (e: any) {
    return fail("خطا در ثبت‌نام.", 500, { detail: e?.message });
  }
}
