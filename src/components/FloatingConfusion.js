"use client";

import { useMemo } from "react";

export default function FloatingConfusion({ words }) {
  const items = useMemo(() => {
    return words.map((word) => ({
      word,
      top: 20 + Math.random() * 40,
      left: 20 + Math.random() * 60,
    }));
  }, [words]);

  return (
    <div className="confusion-layer">
      {items.map((item, i) => (
        <span
          key={i}
          className="confusion-item"
          style={{ top: `${item.top}%`, left: `${item.left}%` }}
        >
          {item.word}
        </span>
      ))}
    </div>
  );
}
