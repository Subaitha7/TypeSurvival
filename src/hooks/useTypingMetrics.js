"use client";

import { useState, useEffect, useRef } from "react";

export default function useTypingMetrics() {

  const startTime        = useRef(null);
  const totalChars       = useRef(0);
  const correctChars     = useRef(0);
  const totalKeystrokes  = useRef(0);

  const [wpm,      setWpm]      = useState(0);
  const [kspc,     setKspc]     = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const startTyping = () => {
    if (!startTime.current) {
      startTime.current = Date.now();
    }
  };

  const addKeystroke   = () => { totalKeystrokes.current += 1; };
  const addCorrectChar = () => { totalChars.current += 1; correctChars.current += 1; };
  const addWrongChar   = () => { totalChars.current += 1; };

  const resetMetrics = () => {
    startTime.current       = null;
    totalChars.current      = 0;
    correctChars.current    = 0;
    totalKeystrokes.current = 0;
    setWpm(0);
    setKspc(0);
    setAccuracy(100);
  };

  // Returns final computed values straight from refs — never stale
  const getFinalMetrics = () => {
    if (!startTime.current || totalChars.current === 0) {
      return { wpm: 0, accuracy: 100, kspc: 0 };
    }
    const elapsedMinutes = (Date.now() - startTime.current) / 60000;
    const finalWpm       = elapsedMinutes > 0
      ? Math.round((totalChars.current / 5) / elapsedMinutes)
      : 0;
    const finalAccuracy  = parseFloat(
      ((correctChars.current / totalChars.current) * 100).toFixed(1)
    );
    const finalKspc      = parseFloat(
      (totalKeystrokes.current / totalChars.current).toFixed(2)
    );
    return { wpm: finalWpm, accuracy: finalAccuracy, kspc: finalKspc };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!startTime.current) return;
      const elapsedMinutes = (Date.now() - startTime.current) / 60000;
      const words          = totalChars.current / 5;
      setWpm(Math.round(elapsedMinutes > 0 ? words / elapsedMinutes : 0));
      setKspc(totalChars.current > 0
        ? parseFloat((totalKeystrokes.current / totalChars.current).toFixed(2))
        : 0);
      setAccuracy(totalChars.current > 0
        ? parseFloat(((correctChars.current / totalChars.current) * 100).toFixed(1))
        : 100);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return {
    wpm, accuracy, kspc,
    startTyping, addKeystroke, addCorrectChar, addWrongChar,
    resetMetrics,
    getFinalMetrics,   // ← new
  };
}