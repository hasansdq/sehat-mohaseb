import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email ?? "").toString().trim().toLowerCase();
    const mobile = (body.mobile ?? "").toString().trim() || null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("ایمیل نامعتبر است.", 422);
    await db.newsletter.upsert({
      where: { email },
      update: { mobile },
      create: { email, mobile },
    });
    return ok({ done: true });
  } catch (e: any) {
    return fail("خطا در ثبت خبرنامه.", 500);
  }
}
