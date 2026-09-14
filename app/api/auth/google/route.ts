import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { OAUTH_STATE_COOKIE, safeReturnPath, sign } from "../../../../lib/auth";
import { buildConsentUrl } from "../../../../lib/google-oauth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const returnTo = safeReturnPath(
    new URL(request.url).searchParams.get("return_to"),
  );
  const nonce = randomBytes(16).toString("hex");
  const state = sign({
    nonce,
    returnTo,
    exp: Math.floor(Date.now() / 1000) + 600,
  });

  const response = NextResponse.redirect(buildConsentUrl(request, state));
  // Bound to the browser so a replayed state from elsewhere cannot be used.
  response.cookies.set(OAUTH_STATE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}
