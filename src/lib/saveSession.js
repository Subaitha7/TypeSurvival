export async function saveSession({ username, wpm, accuracy, kspc, survivalScore }) {
  try {
    // Fallback: read from localStorage in case React state was stale
    const name = (username && username.trim())
      || (typeof window !== "undefined" && localStorage.getItem("ts_username"))
      || "Anonymous";

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: name, wpm, accuracy, kspc, survivalScore }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("saveSession error:", err);
      return { ok: false };
    }

    const data = await res.json();
    console.log("Session saved:", data.id);
    return { ok: true };
  } catch (err) {
    console.error("saveSession network error:", err);
    return { ok: false };
  }
}