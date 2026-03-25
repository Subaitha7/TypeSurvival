import { useState, useEffect, useRef } from "react";

export default function useAutocomplete() {
  const [text, setText] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/trie.worker.js", import.meta.url)
    );

    workerRef.current.onmessage = (event) => {
      const suggestions = event.data.suggestions;
      setSuggestion(suggestions[0] || "");
    };

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  useEffect(() => {
    if (!workerRef.current) return;

    const timer = setTimeout(() => {
      workerRef.current.postMessage({
        prefix: text,
        heatMode: text.length > 3
      });
    }, 20);

    return () => clearTimeout(timer);
  }, [text]);

  return {
    text,
    setText,
    suggestion,
  };
}