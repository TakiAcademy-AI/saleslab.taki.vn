import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "../../../db";
import { trainingSessions, users } from "../../../db/schema";
import { getSessionUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

function decode(row: typeof trainingSessions.$inferSelect) {
  return { ...row, metrics: JSON.parse(row.metricsJson), transcript: JSON.parse(row.transcriptJson), createdAt: row.createdAt.toISOString(), metricsJson: undefined, transcriptJson: undefined };
}

export async function GET() {
  const identity = await getSessionUser();
  if (!identity) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await getDb().select().from(trainingSessions).where(eq(trainingSessions.userId, identity.userId)).orderBy(desc(trainingSessions.createdAt)).limit(50);
  return NextResponse.json({ sessions: rows.map(decode) });
}

export async function POST(request: Request) {
  const identity = await getSessionUser();
  if (!identity) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [profile] = await getDb().select({ id: users.id }).from(users).where(eq(users.id, identity.userId)).limit(1);
  if (!profile) return NextResponse.json({ error: "Cần hoàn tất đăng ký" }, { status: 400 });
  const body = (await request.json()) as { productId?: string; scenarioId?: string; score?: number; turns?: number; metrics?: unknown; transcript?: unknown };
  const score = Math.round(Number(body.score));
  const turns = Math.round(Number(body.turns));
  const metricsJson = JSON.stringify(body.metrics ?? {});
  const transcriptJson = JSON.stringify(body.transcript ?? []);
  if (!body.productId || !body.scenarioId || !Number.isFinite(score) || score < 0 || score > 100 || turns < 1 || metricsJson.length > 20_000 || transcriptJson.length > 120_000) {
    return NextResponse.json({ error: "Dữ liệu phiên luyện không hợp lệ" }, { status: 400 });
  }
  const value = { id: crypto.randomUUID(), userId: identity.userId, productId: body.productId, scenarioId: body.scenarioId, score, turns, metricsJson, transcriptJson, createdAt: new Date() };
  await getDb().insert(trainingSessions).values(value);
  return NextResponse.json({ session: decode(value) }, { status: 201 });
}
