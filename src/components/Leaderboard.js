"use client";

import { useEffect, useState } from "react";
import { getLeaderboard } from "../lib/getLeaderboard";

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
    <div>

        <h2>🏆 Leaderboard</h2>

        {scores.map((s, index) => (
        <div key={s.id} style={{marginBottom:"10px"}}>
            {index + 1}. WPM: {s.wpm} | Accuracy: {s.accuracy}% | Score: {s.survival_score}
        </div>
        ))}

    </div>
  ); 
}