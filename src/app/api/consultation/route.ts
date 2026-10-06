import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { normalizeMobile, isValidMobile } from "@/lib/auth";
import { ok, fail, getClientIp, getAuthContext } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.name ?? "").toString().trim();
    const mobile = normalizeMobile(body.mobile ?? "");
    const topic = (body.topic ?? "").toString().trim() || null;
    const businessType = (body.businessType ?? "").toString().trim() || null;
    const message = (body.message ?? "").toString().trim();
    const preferredTime = (body.preferredTime ?? "").toString().trim() || null;
    const source = (body.source ?? "form").toString();

    if (name.length < 2) return fail("نام را وارد کنید.", 422);
    if (!isValidMobile(mobile)) return fail("شماره موبایل نامعتبر است.", 422);
    if (message.length < 5 && !topic) return fail("موضوع یا پیام را وارد کنید.", 422);

    const ctx = await getAuthContext(req);

    const created = await db.consultationRequest.create({
      data: {
        userId: ctx.user?.id ?? null,
        name, mobile, topic, businessType, message, preferredTime, source,
      },
    });
    return ok({ id: created.id });
  } catch (e: any) {
    return fail("خطا در ثبت درخواست.", 500, { detail: e?.message });
  }
}
