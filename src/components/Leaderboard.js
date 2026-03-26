"use client";

import { useEffect, useState } from "react";
import { getLeaderboard } from "../lib/getLeaderboard";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function loadScores() {
      const data = await getLeaderboard();
      setScores(data);
    }
    loadScores();
    const interval = setInterval(loadScores, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>Leaderboard</h2>
      </div>

      {scores.length === 0 && (
        <div style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "14px", padding: "12px" }}>
          No sessions yet — finish a round to appear here.
        </div>
      )}

      {scores.map((s, index) => (
        <div key={s.id} className="leaderboard-row">
          <div className="leaderboard-rank">
            {index < 3 ? MEDALS[index] : `${index + 1}`}
          </div>
          <div className="leaderboard-stats">
            <div><span>{s.wpm}</span> wpm</div>
            <div><span>{s.accuracy}%</span> acc</div>
            <div><span>{s.kspc}</span> kspc</div>
          </div>
          <div className="leaderboard-score">{Math.round(s.survival_score)}</div>
        </div>
      ))}
    </div>
  );
}
