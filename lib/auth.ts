import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type SessionUser = {
  userId: string;
  email: string;
  fullName: string | null;
  displayName: string;
};

type SessionPayload = {
  sub: string;
  email: string;
  name: string | null;
  exp: number;
};

export const SESSION_COOKIE = "taki_session";
export const OAUTH_STATE_COOKIE = "taki_oauth_state";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET ?? "";
  if (secret.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or shorter than 32 characters. Generate one with `openssl rand -hex 32`.",
    );
  }
  return secret;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(value: string): Buffer {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

/** Signs an arbitrary payload as `<base64url(json)>.<base64url(hmac)>`. */
export function sign(payload: object): string {
  const body = base64url(JSON.stringify(payload));
  const mac = createHmac("sha256", sessionSecret()).update(body).digest();
  return `${body}.${base64url(mac)}`;
}

/** Verifies a token produced by `sign` and returns its payload, or null. */
export function verify<T>(token: string | undefined | null): T | null {
  if (!token) return null;
  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;

  const body = token.slice(0, separator);
  const expected = createHmac("sha256", sessionSecret()).update(body).digest();
  const received = fromBase64url(token.slice(separator + 1));
  if (received.length !== expected.length) return null;
  if (!timingSafeEqual(received, expected)) return null;

  try {
    return JSON.parse(fromBase64url(body).toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function createSessionToken(user: {
  sub: string;
  email: string;
  name: string | null;
}): string {
  const payload: SessionPayload = {
    sub: user.sub,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  return sign(payload);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = verify<SessionPayload>(token);
  if (!payload?.sub || !payload.email) return null;
  if (!payload.exp || payload.exp * 1000 < Date.now()) return null;

  return {
    userId: payload.sub,
    email: payload.email,
    fullName: payload.name,
    displayName: payload.name ?? payload.email,
  };
}

/** True when the signed-in email matches TAKI_ADMIN_EMAIL (comma-separated list allowed). */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.TAKI_ADMIN_EMAIL ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.trim().toLowerCase());
}

/**
 * Allowlist for who may sign in at all. Empty/unset means "deny nobody", which
 * we deliberately avoid: the default keeps the tool internal to taki.vn.
 */
export function isAllowedEmail(email: string): boolean {
  const raw = process.env.ALLOWED_EMAIL_DOMAINS ?? "taki.vn";
  const rules = raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (rules.includes("*")) return true;

  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1] ?? "";
  return rules.some((rule) =>
    rule.includes("@") ? rule === normalized : rule === domain,
  );
}

/**
 * Public origin of the app. Behind a reverse proxy the standalone server sees
 * its own bind address (0.0.0.0:3000), so `new URL(request.url).origin` would
 * build redirects the browser cannot follow. Prefer the configured origin.
 */
export function appOrigin(request: Request): string {
  const configured = (process.env.APP_URL ?? "").trim().replace(/\/+$/, "");
  if (configured) return configured;

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

/** Only allow relative paths so `return_to` can never bounce users off-site. */
export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const url = new URL(value, "https://app.local");
    if (url.origin !== "https://app.local") return "/";
    if (url.pathname.startsWith("/api/auth")) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
