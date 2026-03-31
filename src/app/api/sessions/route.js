import { NextResponse } from "next/server";
import redis from "@/lib/redisClient";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, wpm, accuracy, kspc, survivalScore } = body;

    if (
      typeof username !== "string" ||
      username.trim().length === 0 ||
      typeof wpm !== "number" || isNaN(wpm) ||
      typeof accuracy !== "number" || isNaN(accuracy) ||
      typeof kspc !== "number" || isNaN(kspc) ||
      typeof survivalScore !== "number" || isNaN(survivalScore) || !isFinite(survivalScore)
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const cleanName = username.trim().slice(0, 20);

    const session = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      username: cleanName,
      wpm: Math.round(wpm),
      accuracy: parseFloat(accuracy.toFixed(1)),
      kspc: parseFloat(kspc.toFixed(2)),
      survival_score: parseFloat(survivalScore.toFixed(2)),
      created_at: new Date().toISOString(),
    };

    // Store full session in hash
    await redis.hset("sessions", { [session.id]: JSON.stringify(session) });

    // Global leaderboard sorted set (all users, by survival_score)
    await redis.zadd("leaderboard", {
      score: session.survival_score,
      member: session.id,
    });

    // Per-user sorted set  leaderboard:user:<username>
    const userKey = `leaderboard:user:${cleanName.toLowerCase()}`;
    await redis.zadd(userKey, {
      score: session.survival_score,
      member: session.id,
    });

    return NextResponse.json({ ok: true, id: session.id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/sessions error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
