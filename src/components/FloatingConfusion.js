"use client";

import { useMemo } from "react";

export default function FloatingConfusion({ words }) {
  const items = useMemo(() => {
    return words.map((word) => ({
      word,
      top:  15 + Math.random() * 50,
      left: 5  + Math.random() * 75,
      delay: Math.random() * 0.3,
    }));
  }, [words]);

  return (
    <div className="confusion-layer">
      {items.map((item, i) => (
        <span
          key={i}
          className="confusion-item"
          style={{
            top:            `${item.top}%`,
            left:           `${item.left}%`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.word}
        </span>
      ))}
    </div>
  );
}
