"use client";

import { useEffect, useRef, useState } from "react";

// Secure 6-digit passcode entry. The value lives only in this component and is handed
// straight to local crypto by the parent — it is never shown in the chat or sent anywhere.

/** `at` makes repeated identical errors still trigger the shake. */
export type PadError = { msg: string; at: number };
export const padError = (msg: string): PadError => ({ msg, at: Date.now() });
export function PasscodePad({
  title,
  subtitle,
  error,
  busy,
  onComplete,
  footer,
}: {
  title: string;
  subtitle?: string;
  error?: PadError | null;
  busy?: boolean;
  onComplete: (passcode: string) => void;
  footer?: React.ReactNode;
}) {
  const [value, setValue] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clear + shake when an error comes in; refocus whenever we're ready for input.
  useEffect(() => {
    if (error) setShakeKey((k) => k + 1);
  }, [error]);
  useEffect(() => {
    setValue("");
    if (!busy) inputRef.current?.focus();
  }, [title, busy]);

  return (
    <div className="animate-slide-up border-t border-juno-100 bg-white px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.12)]">
      <div className="mb-1 flex items-center gap-2">
        <LockIcon />
        <h2 className="text-base font-extrabold">{title}</h2>
      </div>
      {subtitle && <p className="mb-4 text-sm text-ink/70">{subtitle}</p>}

      <label className="relative block cursor-text" onClick={() => inputRef.current?.focus()}>
        <span className="sr-only">{title}</span>
        <div key={shakeKey} className={`flex justify-center gap-3 py-2 ${error ? "animate-shake" : ""}`} aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={`h-4 w-4 rounded-full border-2 transition ${
                i < value.length ? "scale-110 border-juno-500 bg-juno-500" : "border-juno-200 bg-transparent"
              }`}
            />
          ))}
        </div>
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          pattern="[0-9]*"
          maxLength={6}
          disabled={busy}
          value={value}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
            setValue(digits);
            if (digits.length === 6) {
              setValue("");
              onComplete(digits);
            }
          }}
          className="absolute inset-0 h-full w-full opacity-0"
        />
      </label>

      <p className="mt-2 min-h-5 text-center text-sm font-semibold text-red-600" role="alert">
        {busy ? <span className="text-juno-700">Checking…</span> : error?.msg}
      </p>
      {footer && <div className="mt-2 text-center">{footer}</div>}
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#168877" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/** Reject passcodes that are trivially guessable (all the same digit, or straight runs). */
export function isWeakPasscode(code: string) {
  if (/^(\d)\1{5}$/.test(code)) return true;
  const runs = ["0123456789", "9876543210"];
  return runs.some((r) => r.includes(code));
}
