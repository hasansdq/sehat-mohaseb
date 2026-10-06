import { NextRequest } from "next/server";
import { ok, getAdminContext } from "@/lib/api";
import { getSetting } from "@/lib/settings";

export async function GET(req: NextRequest) {
  const ctx = await getAdminContext(req);
  if (!ctx.admin) return ok({ admin: null });
  const displayName = await getSetting("admin.displayName");
  return ok({ admin: { username: ctx.admin.username, displayName } });
}
