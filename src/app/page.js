"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import generateSentence from "@/lib/generateSentence";
import getConfusingWords from "@/lib/getConfusingWords";
import useTypingMetrics from "@/hooks/useTypingMetrics";
import GhostInput from "@/components/GhostInput";
import Leaderboard from "@/components/Leaderboard";
import FloatingConfusion from "@/components/FloatingConfusion";
import FloatingChaos from "@/components/FloatingChaos";
import trie from "@/lib/trieClient";
import words from "@/lib/words.json";
import { saveSession } from "@/lib/saveSession";

// Burst particle on wrong key / wrong autocomplete
function spawnBurst(x, y, char, isWrong, count = 1) {
  for (let b = 0; b < count; b++) {
    const el = document.createElement("span");
    el.className = "burst-particle";
    el.textContent = char || "✕";
    el.style.left = `${x + (Math.random() - 0.5) * 30}px`;
    el.style.top  = `${y + (Math.random() - 0.5) * 20}px`;
    el.style.color = isWrong ? "var(--red)" : "var(--green)";
    el.style.textShadow = `0 0 8px currentColor`;
    const angle = (Math.random() - 0.5) * Math.PI * 1.4;
    const dist  = 30 + Math.random() * 70;
    el.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    el.style.setProperty("--dy", `${-Math.abs(Math.sin(angle)) * dist - 20}px`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }
}

/* ──────────────────────────────────────────────────────────
   INTRO SCREEN
────────────────────────────────────────────────────────── */
function IntroScreen({ onStart }) {
  return (
    <div className="intro-screen">
      <div className="intro-content">
        <div className="intro-logo">
          <span className="intro-logo-main">TypeSurvival</span>
          <span className="intro-logo-bolt">⚡</span>
        </div>
        <p className="intro-tagline">The typing test that fights back</p>

        <div className="intro-rules">
          <div className="intro-rule">
            <span className="intro-rule-icon">⌨</span>
            <span>Type each word and press <kbd>Space</kbd> to advance</span>
          </div>
          <div className="intro-rule">
            <span className="intro-rule-icon">↵</span>
            <span>Press <kbd>Enter</kbd> to accept the TRIE suggestion — if it matches the target word, you advance instantly</span>
          </div>
          <div className="intro-rule">
            <span className="intro-rule-icon">🔥</span>
            <span>Hit <strong>30+ WPM</strong> to enter Heat Mode — confusing words appear</span>
          </div>
          <div className="intro-rule">
            <span className="intro-rule-icon">⚠</span>
            <span>Hit <strong>60+ WPM</strong> to enter Chaos Mode — matrix rain and shockwaves take over</span>
          </div>
          <div className="intro-rule">
            <span className="intro-rule-icon">✕</span>
            <span>Wrong autocomplete = screen punishment. Stay sharp.</span>
          </div>
        </div>

        <button className="intro-start-btn" onClick={onStart}>
          <span>Start Surviving</span>
          <span className="intro-start-arrow">→</span>
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────────────────── */
export default function Page() {
  const [showIntro, setShowIntro]   = useState(true);
  const [gameReady, setGameReady]   = useState(false);

  const [sentence, setSentence]     = useState([]);
  const [index, setIndex]           = useState(0);
  const [difficulty, setDifficulty] = useState("medium");
  const [isShaking, setIsShaking]   = useState(false);
  const [wrongKeyPos, setWrongKeyPos] = useState(null);
  const inputRef    = useRef("");
  const cardRef     = useRef(null);
  const inputElRef  = useRef(null);
  const [, forceUpdate] = useState(0);

  const {
    wpm, accuracy, kspc,
    startTyping, addKeystroke, addCorrectChar, addWrongChar, resetMetrics,
  } = useTypingMetrics();

  const heatMode  = wpm >= 20 && wpm < 30;
  const chaosMode = wpm >= 30;
  const chaosIntensity = chaosMode ? 3 : heatMode ? 2 : wpm >= 15 ? 1 : 0;

  useEffect(() => {
    setSentence(generateSentence(10, difficulty));
  }, []);

  const currentWord = sentence[index] || "";
  const progress    = sentence.length > 0 ? (index / sentence.length) * 100 : 0;

  // Handle intro → game transition
  const handleStartGame = () => {
    setShowIntro(false);
    setTimeout(() => setGameReady(true), 50);
  };

  const triggerShake = useCallback((intensity = 1) => {
    if (!cardRef.current) return;
    const cls = intensity >= 2 ? "shake-hard" : "shake";
    cardRef.current.classList.add(cls);
    setTimeout(() => cardRef.current?.classList.remove(cls), 480);
  }, []);

  // Build viewport-coords wrongKeyPos for FloatingChaos
  const recordWrongPos = useCallback(() => {
    if (inputElRef.current) {
      const rect = inputElRef.current.getBoundingClientRect();
      // Centre-ish of the input, viewport coords
      const pos = {
        x: rect.left + rect.width * 0.4 + Math.random() * rect.width * 0.2,
        y: rect.top  + rect.height * 0.5,
      };
      setWrongKeyPos({ ...pos }); // new object reference to trigger effect
      return pos;
    }
    return null;
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    inputRef.current = value;
    forceUpdate((n) => n + 1);

    startTyping();
    addKeystroke();

    const typedChar    = value[value.length - 1];
    const expectedChar = currentWord[value.length - 1];
    const isWrong      = typedChar !== expectedChar;

    if (!isWrong) {
      addCorrectChar();
    } else {
      addWrongChar();
      if (heatMode || chaosMode) triggerShake(1);
      const pos = recordWrongPos();
      if (pos) spawnBurst(pos.x, pos.y, typedChar, true, 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === " ") {
      e.preventDefault();
      // Only advance if the currently typed value exactly matches the target word
      if (inputRef.current === currentWord) {
        advanceWord();
      }
    }
  };

  const advanceWord = useCallback(() => {
    if (index < sentence.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setSentence(generateSentence(10, difficulty));
      setIndex(0);
    }
    inputRef.current = "";
    forceUpdate((n) => n + 1);
  }, [index, sentence.length, difficulty]);

  // ── Autocomplete Enter handler ──────────────────────
  const handleAcceptSuggestion = useCallback((suggestion) => {
    if (!suggestion) return;

    if (suggestion === currentWord) {
      // ✅ Correct autocomplete — accept and advance
      inputRef.current = currentWord;
      forceUpdate((n) => n + 1);
      // Small green burst then advance
      if (inputElRef.current) {
        const rect = inputElRef.current.getBoundingClientRect();
        spawnBurst(rect.left + rect.width / 2, rect.top, "✓", false, 3);
      }
      setTimeout(advanceWord, 120);
    } else {
      // ❌ Wrong autocomplete — HIGH intensity punishment
      addWrongChar();
      addWrongChar(); // double penalty for being wrong
      triggerShake(2);
      const pos = recordWrongPos();
      if (pos) {
        spawnBurst(pos.x, pos.y, "✕", true, 6);
      }
      // Flash the input red briefly
      if (inputElRef.current) {
        inputElRef.current.classList.add("wrong-autocomplete-flash");
        setTimeout(() => inputElRef.current?.classList.remove("wrong-autocomplete-flash"), 500);
      }
    }
  }, [currentWord, advanceWord, triggerShake, recordWrongPos, addWrongChar]);

  const resetSession = () => {
    setSentence(generateSentence(10, difficulty));
    setIndex(0);
    inputRef.current = "";
    forceUpdate((n) => n + 1);
    resetMetrics();
    setWrongKeyPos(null);
  };

  const handleFinish = async () => {
    const survivalScore = wpm * accuracy;
    await saveSession({ wpm, accuracy, kspc, survivalScore });
    resetSession();
  };

  const suggestions = useMemo(() => {
    if (!inputRef.current) return [];
    return trie.getSuggestions(inputRef.current, 3);
  }, [inputRef.current]);

  const confusingWords = useMemo(() => {
    return getConfusingWords(currentWord, words);
  }, [currentWord]);

  const typedText = inputRef.current;
  const modeLabel = chaosMode ? "chaos" : heatMode ? "heat" : null;

  if (showIntro) return <IntroScreen onStart={handleStartGame} />;

  return (
    <div className={`container${gameReady ? " game-visible" : ""}${heatMode ? " heat-mode" : ""}${chaosMode ? " chaos-mode" : ""}`}>
      <h1 className="title">TypeSurvival ⚡</h1>
      <p className="subtitle">The typing test that fights back</p>

      {modeLabel && (
        <div className={`mode-badge ${modeLabel}`}>
          <span className="mode-badge-dot" />
          {modeLabel === "chaos" ? "⚠ CHAOS MODE" : "🔥 HEAT MODE"}
        </div>
      )}

      {/* FloatingChaos at viewport level — always mounted, shows when intensity > 0 */}
      <FloatingChaos intensity={chaosIntensity} wrongKeyPos={wrongKeyPos} />

      <div ref={cardRef} className="game-card">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="sentence-box">
          {sentence.map((word, i) => {
            if (i < index) return <span key={i} className="word done">{word}</span>;
            if (i !== index) return <span key={i} className="word">{word}</span>;
            return (
              <span key={i} className="word active">
                {word.split("").map((char, charIndex) => {
                  const typedChar = typedText[charIndex];
                  let cls = "char";
                  if (typedChar != null) cls = typedChar === char ? "char correct" : "char wrong";
                  return <span key={charIndex} className={cls}>{char}</span>;
                })}
              </span>
            );
          })}
        </div>

        <div className="typing-box">
          {(heatMode || chaosMode) && (
            <FloatingConfusion words={confusingWords} />
          )}

          <GhostInput
            text={typedText}
            suggestion={suggestions[0] || ""}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onAcceptSuggestion={handleAcceptSuggestion}
            inputRef={inputElRef}
          />
        </div>

        <div className="stats-box">
          <div className="stat">
            <div className="stat-value">{wpm}</div>
            <div className="stat-label">WPM</div>
          </div>
          <div className="stat">
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="stat">
            <div className="stat-value">{kspc}</div>
            <div className="stat-label">KSPC</div>
          </div>
        </div>

        <div className="difficulty-box">
          {["easy", "medium", "hard"].map((d) => (
            <button
              key={d}
              className={`difficulty-btn${difficulty === d ? " active" : ""}`}
              onClick={() => {
                setDifficulty(d);
                setSentence(generateSentence(10, d));
                setIndex(0);
                inputRef.current = "";
                forceUpdate((n) => n + 1);
                resetMetrics();
              }}
            >
              {d}
            </button>
          ))}
        </div>

        <button className="finish-btn" onClick={handleFinish}>
          Finish Session
        </button>
      </div>

      <div className="leaderboard">
        <Leaderboard />
      </div>
    </div>
  );
}
