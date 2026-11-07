"use client";

import { useEffect, useState } from "react";
import { useVault } from "@/lib/vault";
import { Onboarding } from "@/components/Onboarding";
import { LockScreen } from "@/components/LockScreen";
import { Home } from "@/components/Home";
import { JunoAvatar } from "@/components/JunoAvatar";

export default function Page() {
  const { status } = useVault();
  // Keep the onboarding chat on screen after the account is created, until the user taps Continue.
  const [onboarding, setOnboarding] = useState(false);
  useEffect(() => {
    if (status === "new") setOnboarding(true);
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <JunoAvatar size={64} className="animate-pulse" />
      </div>
    );
  }
  if (status === "new" || onboarding) return <Onboarding onDone={() => setOnboarding(false)} />;
  if (status === "locked") return <LockScreen />;
  return <Home />;
}
