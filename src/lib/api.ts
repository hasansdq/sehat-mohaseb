import "server-only";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, type AppTokenPayload } from "@/lib/auth";

export const ACCESS_COOKIE = "sm_access";
export const ADMIN_COOKIE = "sm_admin";

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export function getUserAgent(req: NextRequest): string {
  return req.headers.get("user-agent") || "unknown";
}

export async function getAuthContext(req: NextRequest): Promise<{
  user: null | { id: string; mobile: string; role: string; fullName: string | null };
  token: AppTokenPayload | null;
}> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) return { user: null, token: null };
  const payload = verifyToken<AppTokenPayload>(token);
  if (!payload) return { user: null, token: null };
  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, mobile: true, role: true, fullName: true, status: true },
  });
  if (!user || user.status !== "ACTIVE") return { user: null, token: null };
  return {
    user: { id: user.id, mobile: user.mobile, role: user.role, fullName: user.fullName },
    token: payload,
  };
}

export async function getAdminContext(req: NextRequest): Promise<{
  admin: null | { id: string; username: string };
  token: any;
}> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return { admin: null, token: null };
  const payload: any = verifyToken(token);
  if (!payload || payload.admin !== true) return { admin: null, token: null };
  return { admin: { id: payload.sub, username: payload.username }, token: payload };
}

export async function requireUser(req: NextRequest) {
  const ctx = await getAuthContext(req);
  return ctx.user;
}

export async function requireAdmin(req: NextRequest) {
  const ctx = await getAdminContext(req);
  return ctx.admin;
}

export async function logActivity(input: {
  userId?: string;
  actor?: string;
  action: string;
  target?: string;
  ip?: string;
  userAgent?: string;
  meta?: any;
}) {
  try {
    await db.activityLog.create({
      data: {
        userId: input.userId ?? null,
        actor: input.actor ?? null,
        action: input.action,
        target: input.target ?? null,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
        meta: input.meta ? JSON.stringify(input.meta) : null,
      },
    });
  } catch {
    // logging must never throw
  }
}

export function ok(data: any, init?: ResponseInit) {
  return Response.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, extra?: any) {
  return Response.json({ ok: false, error: message, ...(extra ?? {}) }, { status });
}
