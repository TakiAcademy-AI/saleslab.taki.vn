import { NextResponse } from "next/server";
import { appOrigin, SESSION_COOKIE } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

function clear(request: Request) {
  const response = NextResponse.redirect(new URL("/", appOrigin(request)));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export async function GET(request: Request) {
  return clear(request);
}

export async function POST(request: Request) {
  return clear(request);
}
