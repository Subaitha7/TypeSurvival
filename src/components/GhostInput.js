"use client";

export default function GhostInput({ text, suggestion, onChange, onKeyDown }) {
  const remaining =
    suggestion.startsWith(text) ? suggestion.slice(text.length) : "";

  return (
    <div className="input-wrapper">
      <div className="ghost-text">
        <span className="typed">{text}</span>
        <span className="ghost">{remaining}</span>
      </div>

      <input
        className="typing-input"
        value={text}
        onChange={onChange}
        onKeyDown={onKeyDown}
        autoFocus
      />
    </div>
  );
}
