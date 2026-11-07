"use client";

import { useEffect, useRef } from "react";
import { JunoAvatar } from "../JunoAvatar";

export type ChatMessage = { id: string; from: "juno" | "user"; text: string; note?: string };

export function ChatHeader({ subtitle, right }: { subtitle?: string; right?: React.ReactNode }) {
  return (
    <header className="flex items-center gap-3 border-b border-juno-100 bg-white/80 px-4 py-3 backdrop-blur">
      <JunoAvatar size={40} />
      <div className="min-w-0 flex-1">
        <h1 className="text-base font-extrabold leading-tight">Juno</h1>
        <p className="truncate text-xs text-juno-700">{subtitle ?? "Your health profile helper"}</p>
      </div>
      {right}
    </header>
  );
}

export function MessageList({ messages, typing }: { messages: ChatMessage[]; typing: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
      <div className="flex flex-col gap-2">
        {messages.map((m, i) => (
          <Bubble key={m.id} message={m} showAvatar={m.from === "juno" && messages[i + 1]?.from !== "juno" && !(typing && i === messages.length - 1)} />
        ))}
        {typing && <TypingBubble />}
        <div ref={endRef} />
      </div>
    </div>
  );
}

function Bubble({ message, showAvatar }: { message: ChatMessage; showAvatar: boolean }) {
  if (message.from === "user") {
    return (
      <div className="animate-bubble-in flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-juno-500 px-4 py-2.5 text-[15px] text-white shadow-sm">
          {message.text}
          {message.note && <div className="mt-0.5 text-xs text-juno-100">{message.note}</div>}
        </div>
      </div>
    );
  }
  return (
    <div className="animate-bubble-in flex items-end gap-2">
      <div className="w-8 shrink-0">{showAvatar && <JunoAvatar size={32} />}</div>
      <div className="max-w-[80%] whitespace-pre-line rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-[15px] shadow-sm ring-1 ring-juno-100">
        {message.text}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="animate-bubble-in flex items-end gap-2" aria-label="Juno is typing">
      <div className="w-8 shrink-0">
        <JunoAvatar size={32} />
      </div>
      <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3.5 shadow-sm ring-1 ring-juno-100">
        {[0, 1, 2].map((i) => (
          <span key={i} className="typing-dot h-2 w-2 rounded-full bg-juno-400" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

export function TextComposer({
  onSend,
  placeholder,
  disabled,
  maxLength = 500,
}: {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  return (
    <form
      className="flex gap-2 border-t border-juno-100 bg-white px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      onSubmit={(e) => {
        e.preventDefault();
        const input = inputRef.current!;
        const text = input.value.trim();
        if (!text || disabled) return;
        onSend(text);
        input.value = "";
      }}
    >
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        maxLength={maxLength}
        placeholder={placeholder ?? "Type a message…"}
        className="min-w-0 flex-1 rounded-full bg-juno-50 px-4 py-2.5 text-[15px] outline-none ring-1 ring-juno-100 focus:ring-2 focus:ring-juno-400 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-full bg-juno-500 px-4 font-bold text-white transition active:scale-95 disabled:opacity-50"
        aria-label="Send"
      >
        Send
      </button>
    </form>
  );
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let idCounter = 0;
export const newId = () => `m${Date.now()}-${idCounter++}`;
