"use client";

import { useMemo } from "react";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function FloatingChaos({ intensity }) {
  const items = useMemo(() => {
    return Array.from({ length: intensity }).map(() => ({
      char: chars[Math.floor(Math.random() * chars.length)],
      top: Math.random() * 200,
      left: Math.random() * 500,
    }));
  }, [intensity]);

  return (
    <div className="chaos-layer">
      {items.map((item, i) => (
        <span
          key={i}
          className="chaos-letter"
          style={{ top: item.top, left: item.left }}
        >
          {item.char}
        </span>
      ))}
    </div>
  );
}
