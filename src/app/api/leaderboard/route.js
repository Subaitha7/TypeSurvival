import { NextResponse } from "next/server";
import redis from "@/lib/redisClient";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    let ids;

    if (username) {
      const userKey = `leaderboard:user:${username.trim().toLowerCase()}`;
      ids = await redis.zrange(userKey, 0, 49, { rev: true });
    } else {
      ids = await redis.zrange("leaderboard", 0, 9, { rev: true });
    }

    if (!ids || ids.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Fetch sessions from hash
    let raw;
    if (ids.length === 1) {
      const single = await redis.hget("sessions", ids[0]);
      raw = [single];
    } else {
      // hmget takes spread fields (not an array arg); returns { fieldName: value } object
      const result = await redis.hmget("sessions", ...ids);
      raw = result ? Object.values(result) : [];
    }

    // Ensure raw is always an array
    if (!Array.isArray(raw)) {
      raw = raw ? [raw] : [];
    }

    const sessions = raw
      .map((item) => {
        if (!item) return null;
        try {
          return typeof item === "string" ? JSON.parse(item) : item;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json(sessions, { status: 200 });
  } catch (err) {
    console.error("GET /api/leaderboard error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
