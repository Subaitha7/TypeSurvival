"use client";

export default function GhostInput({
  text,
  suggestion,
  onChange,
  onKeyDown,
  onAcceptSuggestion,
  inputRef,
}) {
  const remaining =
    suggestion.startsWith(text) ? suggestion.slice(text.length) : "";

  const hasSuggestion = remaining.length > 0;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && hasSuggestion) {
      e.preventDefault();
      // Delegate to page: page knows currentWord and decides correct vs wrong
      if (onAcceptSuggestion) onAcceptSuggestion(suggestion);
      return;
    }
    if (onKeyDown) onKeyDown(e);
  };

  return (
    <div className="input-wrapper">
      <div className="ghost-text">
        <span className="typed">{text}</span>
        <span className="ghost">{remaining}</span>
      </div>

      <input
        ref={inputRef}
        className="typing-input"
        value={text}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        autoFocus
      />

      {/* Trie autocomplete pill */}
      <div className={`trie-suggestion${hasSuggestion ? " visible" : ""}`}>
        <span className="trie-label">TRIE</span>
        {hasSuggestion ? (
          <span className="trie-word">
            <span className="trie-typed">{text}</span>
            <span className="trie-completion">{remaining}</span>
          </span>
        ) : (
          <span className="trie-empty">searching…</span>
        )}
        {hasSuggestion && (
          <span className="trie-hint">↵</span>
        )}
      </div>
    </div>
  );
}
