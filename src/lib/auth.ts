import "server-only";
import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
    throw new Error("JWT_SECRET must contain at least 32 characters in production");
  }
  return secret || "development-only-secret-never-use-in-production";
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const ADMIN_JWT_EXPIRES_IN = process.env.ADMIN_JWT_EXPIRES_IN || "12h";
const REFRESH_EXPIRES_DAYS = 30;

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 12);
}

export function verifyPassword(plain: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}

export type AppTokenPayload = JwtPayload & {
  sub: string; // user id
  mobile: string;
  role: "USER" | "ADMIN";
  kind: "access" | "refresh";
};

export function signAccessToken(payload: Omit<AppTokenPayload, "kind" | "iat" | "exp">): string {
  return jwt.sign({ ...payload, kind: "access" }, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function signAdminAccessToken(payload: { sub: string; username: string; role: "ADMIN" }): string {
  return jwt.sign({ ...payload, kind: "access", admin: true }, getJwtSecret(), {
    expiresIn: ADMIN_JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: Omit<AppTokenPayload, "kind" | "iat" | "exp">): string {
  return jwt.sign({ ...payload, kind: "refresh" }, getJwtSecret(), {
    expiresIn: `${REFRESH_EXPIRES_DAYS}d`,
  } as jwt.SignOptions);
}

export function verifyToken<T = AppTokenPayload>(token: string): T | null {
  try {
    return jwt.verify(token, getJwtSecret()) as T;
  } catch {
    return null;
  }
}

export function hashToken(token: string): string {
  return bcrypt.hashSync(token, 10);
}

// ===== Mobile normalization (Iran) =====
export function normalizeMobile(input: string): string {
  if (!input) return "";
  let m = input.trim().replace(/[\s\-()]/g, "");
  // convert persian/arabic digits
  m = m.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  m = m.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  if (m.startsWith("+98")) m = m.slice(3);
  if (m.startsWith("0098")) m = m.slice(4);
  if (m.startsWith("98")) m = m.slice(2);
  if (m.startsWith("0")) return m;
  if (m.length === 10) return "0" + m;
  return m;
}

export function isValidMobile(input: string): boolean {
  const m = normalizeMobile(input);
  return /^09\d{9}$/.test(m);
}

export function isValidPassword(pw: string): boolean {
  return typeof pw === "string" && pw.length >= 6;
}
