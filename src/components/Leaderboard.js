"use client";

import { useEffect, useState, useCallback } from "react";
import { getLeaderboard } from "../lib/getLeaderboard";

const MEDALS = ["🥇", "🥈", "🥉"];

function ScoreRow({ s, index, showRank = true, showName = false }) {
  const score = parseFloat(s.survival_score) || 0;
  const wpm   = parseInt(s.wpm)              || 0;
  const acc   = parseFloat(s.accuracy)       || 0;
  const kspc  = parseFloat(s.kspc)           || 0;
  const rowKey = s.id || `${index}-${score}`;

  return (
    <div key={rowKey} className="leaderboard-row">
      {showRank && (
        <div className="leaderboard-rank">
          {index < 3 ? MEDALS[index] : `${index + 1}`}
        </div>
      )}
      <div className="leaderboard-stats" style={{ flex: 1 }}>
        {showName && s.username && (
          <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: "2px", fontSize: "13px" }}>
            {s.username}
          </div>
        )}
        <div style={{ display: "flex", gap: "12px" }}>
          <div><span>{wpm}</span> wpm</div>
          <div><span>{acc}%</span> acc</div>
          <div><span>{kspc}</span> kspc</div>
        </div>
      </div>
      <div className="leaderboard-score">{Math.round(score)}</div>
    </div>
  );
}

function TabPanel({ username, mode, refreshTrigger }) {
  const [scores, setScores]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const loadScores = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getLeaderboard(mode === "mine" ? { username } : {});
      if (!Array.isArray(data)) throw new Error("bad response");
      setScores(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [username, mode]);

  useEffect(() => { loadScores(); }, [loadScores, refreshTrigger]);

  useEffect(() => {
    const interval = setInterval(loadScores, 30000);
    return () => clearInterval(interval);
  }, [loadScores]);

  if (loading) return (
    <div className="lb-status">Loading…</div>
  );

  if (error) return (
    <div className="lb-status lb-status--error">
      <span>Failed to load.</span>
      <button className="lb-retry-btn" onClick={loadScores}>Retry</button>
    </div>
  );

  if (scores.length === 0) return (
    <div className="lb-status">
      {mode === "mine"
        ? "No sessions yet — finish a round to see your history."
        : "No scores yet — be the first!"}
    </div>
  );

  return (
    <div>
      {scores.map((s, i) => (
        <ScoreRow
          key={s.id || `row-${i}`}
          s={s}
          index={i}
          showRank={mode === "global"}
          showName={mode === "global"}
        />
      ))}
    </div>
  );
}

export default function Leaderboard({ username, refreshTrigger = 0 }) {
  const [tab, setTab] = useState("global");

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>Leaderboard</h2>
      </div>

      <div className="lb-tabs">
        <button
          className={`lb-tab${tab === "global" ? " lb-tab--active" : ""}`}
          onClick={() => setTab("global")}
        >
          🌐 Global Top 10
        </button>
        <button
          className={`lb-tab${tab === "mine" ? " lb-tab--active" : ""}`}
          onClick={() => setTab("mine")}
        >
          📊 My History
        </button>
      </div>

      <TabPanel
        key={`${tab}-${refreshTrigger}`}
        username={username}
        mode={tab}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}