import { NextResponse } from "next/server";
import {
  appOrigin,
  createSessionToken,
  isAllowedEmail,
  OAUTH_STATE_COOKIE,
  safeReturnPath,
  SESSION_COOKIE,
  sessionCookieOptions,
  verify,
} from "../../../../lib/auth";
import { exchangeCodeForProfile } from "../../../../lib/google-oauth";

export const dynamic = "force-dynamic";

type OAuthState = { nonce: string; returnTo: string; exp: number };

function failure(request: Request, reason: string) {
  const url = new URL("/", appOrigin(request));
  url.searchParams.set("auth_error", reason);
  const response = NextResponse.redirect(url);
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if (params.get("error")) return failure(request, "cancelled");

  const code = params.get("code");
  const state = verify<OAuthState>(params.get("state"));
  const nonce = request.headers
    .get("cookie")
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${OAUTH_STATE_COOKIE}=`))
    ?.slice(OAUTH_STATE_COOKIE.length + 1);

  if (!code) return failure(request, "missing_code");
  if (!state || !state.exp || state.exp * 1000 < Date.now()) {
    return failure(request, "expired_state");
  }
  if (!nonce || nonce !== state.nonce) return failure(request, "bad_state");

  let profile;
  try {
    profile = await exchangeCodeForProfile(request, code);
  } catch (error) {
    console.error("Google OAuth exchange failed:", error);
    return failure(request, "exchange_failed");
  }

  if (!profile.emailVerified) return failure(request, "unverified_email");
  if (!isAllowedEmail(profile.email)) return failure(request, "not_allowed");

  const response = NextResponse.redirect(
    new URL(safeReturnPath(state.returnTo), appOrigin(request)),
  );
  response.cookies.set(
    SESSION_COOKIE,
    createSessionToken({
      sub: profile.sub,
      email: profile.email,
      name: profile.name,
    }),
    sessionCookieOptions(),
  );
  response.cookies.delete(OAUTH_STATE_COOKIE);
  return response;
}
