import { NextRequest } from "next/server";
import { ok, getAuthContext, logActivity, getClientIp } from "@/lib/api";
import { clearAccessCookie } from "@/lib/cookies";

export async function POST(req: NextRequest) {
  const ctx = await getAuthContext(req);
  await clearAccessCookie();
  if (ctx.user) {
    await logActivity({ userId: ctx.user.id, actor: ctx.user.mobile, action: "logout", ip: getClientIp(req) });
  }
  return ok({ done: true });
}
