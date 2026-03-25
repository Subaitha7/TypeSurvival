"use client";

import { useState, useEffect, useRef } from "react";

export default function useTypingMetrics() {

  const startTime = useRef(null);

  const totalChars = useRef(0);
  const correctChars = useRef(0);
  const totalKeystrokes = useRef(0);

  const [wpm, setWpm] = useState(0);
  const [kspc, setKspc] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const startTyping = () => {
    if (!startTime.current) {
      startTime.current = Date.now();
    }
  };

  // ✅ granular tracking
  const addKeystroke = () => {
    totalKeystrokes.current += 1;
  };

  const addCorrectChar = () => {
    totalChars.current += 1;
    correctChars.current += 1;
  };

  const addWrongChar = () => {
    totalChars.current += 1;
  };

  const resetMetrics = () => {
    startTime.current = null;
    totalChars.current = 0;
    correctChars.current = 0;
    totalKeystrokes.current = 0;

    setWpm(0);
    setKspc(0);
    setAccuracy(100);
  };

  useEffect(() => {

    const interval = setInterval(() => {

      if (!startTime.current) return;

      const elapsedMinutes =
        (Date.now() - startTime.current) / 60000;

      const words = totalChars.current / 5;

      const currentWpm =
        elapsedMinutes > 0 ? words / elapsedMinutes : 0;

      setWpm(Math.round(currentWpm));

      const currentKspc =
        totalChars.current > 0
          ? (totalKeystrokes.current / totalChars.current).toFixed(2)
          : 0;

      setKspc(currentKspc);

      const currentAccuracy =
        totalChars.current > 0
          ? ((correctChars.current / totalChars.current) * 100).toFixed(1)
          : 100;

      setAccuracy(currentAccuracy);

    }, 500);

    return () => clearInterval(interval);

  }, []);

  return {
    wpm,
    accuracy,
    kspc,
    startTyping,
    addKeystroke,
    addCorrectChar,
    addWrongChar,
    resetMetrics
  };
}