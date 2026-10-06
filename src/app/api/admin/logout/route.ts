import { NextRequest } from "next/server";
import { ok, getAdminContext, getClientIp, logActivity } from "@/lib/api";
import { clearAdminCookie } from "@/lib/cookies";

export async function POST(req: NextRequest) {
  const ctx = await getAdminContext(req);
  await clearAdminCookie();
  if (ctx.admin) {
    await logActivity({ actor: ctx.admin.username, action: "admin_logout", ip: getClientIp(req) });
  }
  return ok({ done: true });
}
