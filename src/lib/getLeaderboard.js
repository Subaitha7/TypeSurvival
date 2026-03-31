export async function getLeaderboard({ username } = {}) {
  try {
    const url = username
      ? `/api/leaderboard?username=${encodeURIComponent(username)}`
      : "/api/leaderboard";

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("getLeaderboard error:", err);
    return [];
  }
}
