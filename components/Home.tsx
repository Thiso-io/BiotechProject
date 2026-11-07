"use client";

// Temporary home screen for Step 1. Step 2 replaces the placeholder with the medical interview.
import { JunoAvatar } from "./JunoAvatar";
import { useVault } from "@/lib/vault";

export function Home() {
  const { profile, lock } = useVault();
  if (!profile) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-juno-100 bg-white/80 px-4 py-3">
        <div className="flex items-center gap-3">
          <JunoAvatar size={36} />
          <span className="font-extrabold">Juno</span>
        </div>
        <button onClick={lock} className="rounded-full bg-juno-50 px-3 py-1.5 text-sm font-bold text-juno-700 ring-1 ring-juno-200">
          🔒 Lock
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <JunoAvatar size={96} />
        <h1 className="text-2xl font-extrabold">Hi {profile.preferredName}!</h1>
        <p className="text-ink/70">
          Your account is set up and your profile is encrypted on this device.
        </p>
        <div className="w-full rounded-2xl bg-white p-4 text-left text-sm shadow-sm ring-1 ring-juno-100">
          <p className="font-bold text-juno-700">Coming next</p>
          <p className="mt-1 text-ink/70">Juno will chat with you to build your medical profile, one question at a time.</p>
        </div>
        <p className="text-xs text-ink/50">Profile created {new Date(profile.createdAt).toLocaleString("en-GB")}</p>
      </main>
    </div>
  );
}
