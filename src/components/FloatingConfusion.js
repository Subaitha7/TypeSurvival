"use client";

import { useMemo, useEffect, useRef, useState } from "react";

/*
  FloatingConfusion v3 — sequential word appearance:
  Each of the 3 words appears one-by-one with a staggered delay,
  same dramatic fly-in / glitch / scatter-fade effect but:
  - Each word enters ~0.55s after the previous one
  - Disappearance is slightly slower (3.4s total vs 2.6s)
*/

export default function FloatingConfusion({ words }) {
  const [generation, setGeneration] = useState(0);
  const prevWords = useRef([]);

  useEffect(() => {
    if (words.join(",") !== prevWords.current.join(",")) {
      prevWords.current = words;
      setGeneration((g) => g + 1);
    }
  }, [words]);

  const items = useMemo(() => {
    const dirs = ["top", "left", "right"];
    return words.map((word, i) => ({
      word,
      left:     5 + i * 30 + Math.random() * 14,
      top:      8 + Math.random() * 68,
      // Each word waits for the previous to fully appear before starting
      // Word 0: 0s, Word 1: 0.55s, Word 2: 1.1s
      delay:    i * 0.55,
      entryDir: dirs[Math.floor(Math.random() * 3)],
      key:      `${word}-${generation}-${i}`,
    }));
  }, [generation]);

  return (
    <div className="confusion-layer">
      {items.map((item) => (
        <span
          key={item.key}
          className={`confusion-item confusion-entry-${item.entryDir}`}
          style={{
            top:            `${item.top}%`,
            left:           `${item.left}%`,
            animationDelay: `${item.delay}s`,
            // Start invisible; the animation itself fades in
            opacity: 0,
          }}
        >
          {item.word}
        </span>
      ))}
    </div>
  );
}
