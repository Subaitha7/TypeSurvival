"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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

export default function Page() {
  const [sentence, setSentence] = useState([]);
  const [index, setIndex] = useState(0);
  const [difficulty, setDifficulty] = useState("medium");
  const inputRef = useRef("");
  const [, forceUpdate] = useState(0);

  const {
    wpm,
    accuracy,
    kspc,
    startTyping,
    addKeystroke,
    addCorrectChar,
    addWrongChar,
    resetMetrics,
  } = useTypingMetrics();

  const heatMode = wpm >= 30 && wpm < 60;
  const chaosMode = wpm >= 60;

  useEffect(() => {
    setSentence(generateSentence(10, difficulty));
  }, []);

  const currentWord = sentence[index] || "";

  const handleChange = (e) => {
    const value = e.target.value;

    inputRef.current = value;
    forceUpdate((n) => n + 1);

    startTyping();
    addKeystroke();

    const expected = currentWord[value.length - 1];

    if (value[value.length - 1] === expected) {
      addCorrectChar();
    } else {
      addWrongChar();
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
  };

  const handleFinish = async () => {
    const survivalScore = wpm * accuracy;

    await saveSession({
      wpm,
      accuracy,
      kspc,
      survivalScore,
    });

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

  return (
    <div
      className={`container 
      ${heatMode ? "heat-mode" : ""} 
      ${chaosMode ? "chaos-mode" : ""}
    `}
    >
      <h1 className="title">TypeSurvival ⚡</h1>
      <p className="subtitle">The typing test that fights back</p>

      <div className="game-card">
        {/* SENTENCE WITH CHARACTER FEEDBACK */}
        <div className="sentence-box">
          {sentence.map((word, i) => {
            if (i !== index) {
              return (
                <span key={i} className="word">
                  {word}
                </span>
              );
            }

            return (
              <span key={i} className="word active">
                {word.split("").map((char, charIndex) => {
                  const typedChar = typedText[charIndex];

                  let className = "char";

                  if (typedChar != null) {
                    className =
                      typedChar === char ? "char correct" : "char wrong";
                  }

                  return (
                    <span key={charIndex} className={className}>
                      {char}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>

        {/* INPUT */}
        <div className="typing-box">
          <GhostInput
            text={typedText}
            suggestion={suggestions[0] || ""}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          {(heatMode || chaosMode) && (
            <FloatingConfusion words={confusingWords} />
          )}

          <FloatingChaos intensity={chaosMode ? 12 : heatMode ? 5 : 0} />
        </div>

        {/* STATS */}
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

        {/* DIFFICULTY SELECTOR */}
        <div className="difficulty-box">
          {["easy", "medium", "hard"].map((d) => (
            <button
              key={d}
              className={`difficulty-btn ${difficulty === d ? "active" : ""}`}
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
