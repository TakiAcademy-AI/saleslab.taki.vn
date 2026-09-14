import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "../../../db";
import { users } from "../../../db/schema";
import { getSessionUser, isAdminEmail } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const identity = await getSessionUser();
  if (!identity) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [profile] = await getDb().select().from(users).where(eq(users.id, identity.userId)).limit(1);
  return NextResponse.json({ profile: profile ?? null });
}

export async function POST(request: Request) {
  const identity = await getSessionUser();
  if (!identity?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { displayName?: string; team?: string };
  const displayName = body.displayName?.trim() ?? "";
  const team = body.team?.trim() ?? "";
  if (displayName.length < 2 || displayName.length > 80 || team.length < 2 || team.length > 80) {
    return NextResponse.json({ error: "Thông tin đăng ký không hợp lệ" }, { status: 400 });
  }
  const role = isAdminEmail(identity.email) ? ("admin" as const) : ("sale" as const);
  const value = { id: identity.userId, email: identity.email, displayName, team, role, createdAt: new Date() };
  await getDb().insert(users).values(value).onConflictDoUpdate({ target: users.id, set: { email: value.email, displayName, team, role } });
  const [profile] = await getDb().select().from(users).where(eq(users.id, identity.userId)).limit(1);
  return NextResponse.json({ profile });
}
