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

// Spawn a burst particle at a given screen position
function spawnBurst(x, y, char, isWrong) {
  const el = document.createElement("span");
  el.className = "burst-particle";
  el.textContent = char || "✕";
  el.style.left = `${x}px`;
  el.style.top  = `${y}px`;
  el.style.color = isWrong ? "var(--red)" : "var(--green)";
  el.style.textShadow = `0 0 8px currentColor`;

  const angle = (Math.random() - 0.5) * Math.PI;
  const dist  = 30 + Math.random() * 50;
  el.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
  el.style.setProperty("--dy", `${-Math.abs(Math.sin(angle)) * dist - 20}px`);

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 650);
}

export default function Page() {
  const [sentence, setSentence]     = useState([]);
  const [index, setIndex]           = useState(0);
  const [difficulty, setDifficulty] = useState("medium");
  const [isShaking, setIsShaking]   = useState(false);
  const [wrongKeyPos, setWrongKeyPos] = useState(null);
  const inputRef  = useRef("");
  const cardRef   = useRef(null);
  const inputElRef = useRef(null);
  const [, forceUpdate] = useState(0);

  const {
    wpm, accuracy, kspc,
    startTyping, addKeystroke, addCorrectChar, addWrongChar, resetMetrics,
  } = useTypingMetrics();

  // Mode thresholds
  const heatMode  = wpm >= 10 && wpm < 20;
  const chaosMode = wpm >= 20;

  // Intensity levels for chaos particles (0-3)
  const chaosIntensity = chaosMode ? 3 : heatMode ? 2 : wpm >= 15 ? 1 : 0;

  useEffect(() => {
    setSentence(generateSentence(10, difficulty));
  }, []);

  const currentWord = sentence[index] || "";

  // Progress: words completed / total
  const progress = sentence.length > 0 ? (index / sentence.length) * 100 : 0;

  // Trigger card shake
  const triggerShake = useCallback(() => {
    if (!cardRef.current) return;
    setIsShaking(true);
    cardRef.current.classList.add("shake");
    setTimeout(() => {
      setIsShaking(false);
      cardRef.current?.classList.remove("shake");
    }, 380);
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
      // Shake in heat/chaos mode
      if (heatMode || chaosMode) triggerShake();
      // Record position for burst + chaos explosion
      if (inputElRef.current) {
        const rect = inputElRef.current.getBoundingClientRect();
        const pos  = { x: rect.left + rect.width * 0.3, y: rect.top };
        setWrongKeyPos(pos);
        spawnBurst(pos.x + Math.random() * rect.width * 0.4, pos.y, typedChar, true);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === " ") {
      e.preventDefault();
      if (index < sentence.length - 1) {
        setIndex((i) => i + 1);
      } else {
        setSentence(generateSentence(10, difficulty));
        setIndex(0);
      }
      inputRef.current = "";
      forceUpdate((n) => n + 1);
    }
  };

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

  // Determine mode label
  const modeLabel = chaosMode ? "chaos" : heatMode ? "heat" : null;

  return (
    <div className={`container${heatMode ? " heat-mode" : ""}${chaosMode ? " chaos-mode" : ""}`}>
      <h1 className="title">TypeSurvival ⚡</h1>
      <p className="subtitle">The typing test that fights back</p>

      {/* Mode Badge */}
      {modeLabel && (
        <div className={`mode-badge ${modeLabel}`}>
          <span className="mode-badge-dot" />
          {modeLabel === "chaos" ? "⚠ CHAOS MODE" : "🔥 HEAT MODE"}
        </div>
      )}

      <div ref={cardRef} className="game-card">

        {/* Progress Bar */}
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Sentence */}
        <div className="sentence-box">
          {sentence.map((word, i) => {
            if (i < index) {
              return <span key={i} className="word done">{word}</span>;
            }
            if (i !== index) {
              return <span key={i} className="word">{word}</span>;
            }
            return (
              <span key={i} className="word active">
                {word.split("").map((char, charIndex) => {
                  const typedChar = typedText[charIndex];
                  let cls = "char";
                  if (typedChar != null) {
                    cls = typedChar === char ? "char correct" : "char wrong";
                  }
                  return <span key={charIndex} className={cls}>{char}</span>;
                })}
              </span>
            );
          })}
        </div>

        {/* Input */}
        <div className="typing-box">
          <GhostInput
            text={typedText}
            suggestion={suggestions[0] || ""}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            inputRef={inputElRef}
          />

          {(heatMode || chaosMode) && (
            <FloatingConfusion words={confusingWords} />
          )}

          <FloatingChaos intensity={chaosIntensity} wrongKeyPos={wrongKeyPos} />
        </div>

        {/* Stats */}
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

        {/* Difficulty */}
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
