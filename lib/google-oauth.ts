const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
};

export function googleClientId(): string {
  const value = process.env.GOOGLE_CLIENT_ID ?? "";
  if (!value) throw new Error("GOOGLE_CLIENT_ID is not set.");
  return value;
}

function googleClientSecret(): string {
  const value = process.env.GOOGLE_CLIENT_SECRET ?? "";
  if (!value) throw new Error("GOOGLE_CLIENT_SECRET is not set.");
  return value;
}

/**
 * Redirect URI must match Google Console exactly. Prefer the configured public
 * origin so a proxied request cannot rewrite where the code is sent.
 */
export function redirectUri(request: Request): string {
  const configured = (process.env.APP_URL ?? "").trim().replace(/\/+$/, "");
  const origin = configured || new URL(request.url).origin;
  return `${origin}/api/auth/callback`;
}

export function buildConsentUrl(request: Request, state: string): string {
  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set("client_id", googleClientId());
  url.searchParams.set("redirect_uri", redirectUri(request));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  const domains = (process.env.ALLOWED_EMAIL_DOMAINS ?? "taki.vn")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry && entry !== "*" && !entry.includes("@"));
  // Only a UI hint — the real check happens server-side in the callback.
  if (domains.length === 1) url.searchParams.set("hd", domains[0]);
  return url.toString();
}

export async function exchangeCodeForProfile(
  request: Request,
  code: string,
): Promise<GoogleProfile> {
  const tokenResponse = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: googleClientId(),
      client_secret: googleClientSecret(),
      redirect_uri: redirectUri(request),
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) {
    throw new Error(
      `Google token exchange failed (${tokenResponse.status}): ${await tokenResponse.text()}`,
    );
  }
  const { access_token: accessToken } = (await tokenResponse.json()) as {
    access_token?: string;
  };
  if (!accessToken) throw new Error("Google token response had no access_token.");

  const userinfoResponse = await fetch(USERINFO_ENDPOINT, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!userinfoResponse.ok) {
    throw new Error(
      `Google userinfo failed (${userinfoResponse.status}): ${await userinfoResponse.text()}`,
    );
  }
  const profile = (await userinfoResponse.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };
  if (!profile.sub || !profile.email) {
    throw new Error("Google userinfo response was missing sub or email.");
  }

  return {
    sub: profile.sub,
    email: profile.email,
    emailVerified: profile.email_verified === true,
    name: profile.name ?? null,
  };
}
