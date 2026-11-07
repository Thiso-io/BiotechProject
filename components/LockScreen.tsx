"use client";

import { useEffect, useState } from "react";
import { JunoAvatar } from "./JunoAvatar";
import { PasscodePad, padError, type PadError } from "./PasscodePad";
import { useVault } from "@/lib/vault";

const MAX_TRIES = 5;
const COOLDOWN_S = 30;

export function LockScreen() {
  const { unlock, wipe } = useVault();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<PadError | null>(null);
  const [fails, setFails] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [confirmWipe, setConfirmWipe] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handle(code: string) {
    if (cooldown > 0) return;
    setBusy(true);
    const ok = await unlock(code);
    setBusy(false);
    if (ok) return;
    const n = fails + 1;
    setFails(n);
    if (n % MAX_TRIES === 0) {
      setCooldown(COOLDOWN_S);
      setError(padError(`Too many tries. Please wait ${COOLDOWN_S} seconds.`));
    } else {
      setError(padError("That passcode didn't work. Try again."));
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <JunoAvatar size={88} />
        <h1 className="text-2xl font-extrabold">Welcome back!</h1>
        <p className="text-ink/70">Enter your passcode to unlock your health profile.</p>
      </div>

      {confirmWipe ? (
        <div className="animate-slide-up border-t border-red-100 bg-white px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <h2 className="mb-1 text-base font-extrabold text-red-700">Forgot your passcode?</h2>
          <p className="mb-4 text-sm text-ink/80">
            Your profile is only stored on this device, locked with your passcode. There&apos;s no copy on a server, so
            we can&apos;t recover it. The only option is to <strong>wipe all your data and start again</strong>. This
            can&apos;t be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmWipe(false)}
              className="flex-1 rounded-full bg-juno-50 py-3 font-bold text-juno-700 ring-1 ring-juno-200"
            >
              Go back
            </button>
            <button
              onClick={() => wipe()}
              className="flex-1 rounded-full bg-red-600 py-3 font-bold text-white transition active:scale-[0.98]"
            >
              Wipe &amp; start again
            </button>
          </div>
        </div>
      ) : (
        <PasscodePad
          title={cooldown > 0 ? `Try again in ${cooldown}s` : "Enter your passcode"}
          error={error}
          busy={busy || cooldown > 0}
          onComplete={handle}
          footer={
            <button onClick={() => setConfirmWipe(true)} className="text-sm font-semibold text-juno-700 underline">
              Forgot passcode?
            </button>
          }
        />
      )}
    </div>
  );
}
