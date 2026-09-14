import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "../../../../db";
import { trainingSessions, users } from "../../../../db/schema";
import { getSessionUser, isAdminEmail } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const identity = await getSessionUser();
  if (!isAdminEmail(identity?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rows = await getDb().select({
    id: trainingSessions.id,
    userId: trainingSessions.userId,
    displayName: users.displayName,
    email: users.email,
    team: users.team,
    productId: trainingSessions.productId,
    scenarioId: trainingSessions.scenarioId,
    score: trainingSessions.score,
    turns: trainingSessions.turns,
    metricsJson: trainingSessions.metricsJson,
    transcriptJson: trainingSessions.transcriptJson,
    createdAt: trainingSessions.createdAt,
  }).from(trainingSessions).innerJoin(users, eq(trainingSessions.userId, users.id)).orderBy(desc(trainingSessions.createdAt)).limit(200);
  return NextResponse.json({ sessions: rows.map((row) => ({ ...row, metrics: JSON.parse(row.metricsJson), transcript: JSON.parse(row.transcriptJson), createdAt: row.createdAt.toISOString(), metricsJson: undefined, transcriptJson: undefined })) });
}
