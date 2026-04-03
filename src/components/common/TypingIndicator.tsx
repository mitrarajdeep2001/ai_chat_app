'use client';

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}
