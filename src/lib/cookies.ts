import "server-only";
import { cookies } from "next/headers";

const ACCESS_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

const ADMIN_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 12,
};

// Note: we use next/headers cookies() API directly — the response object is
// not needed since Next.js App Router handles cookie setting via the store.
export async function setAccessCookie(token: string) {
  const store = await cookies();
  store.set("sm_access", token, ACCESS_OPTS);
}

export async function setAdminCookie(token: string) {
  const store = await cookies();
  store.set("sm_admin", token, ADMIN_OPTS);
}

export async function clearAccessCookie() {
  const store = await cookies();
  store.set("sm_access", "", { ...ACCESS_OPTS, maxAge: 0 });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.set("sm_admin", "", { ...ADMIN_OPTS, maxAge: 0 });
}
