"use client";

// Step 1: account setup, done by chatting with Juno.
// This part is scripted (no AI call) — the name and passcode never leave the device.
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatHeader, MessageList, TextComposer, newId, sleep, type ChatMessage } from "./chat/Chat";
import { PasscodePad, isWeakPasscode, padError as mkErr, type PadError } from "./PasscodePad";
import { useVault } from "@/lib/vault";

type Stage = "intro" | "name" | "create" | "confirm" | "saving" | "done" | "error";

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { createAccount } = useVault();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [stage, setStage] = useState<Stage>("intro");
  const [name, setName] = useState("");
  const [padError, setPadError] = useState<PadError | null>(null);
  const firstCode = useRef<string | null>(null);
  const started = useRef(false);

  /** Juno "types" each line, one after the other. */
  const say = useCallback(async (...lines: string[]) => {
    for (const text of lines) {
      setTyping(true);
      await sleep(Math.min(450 + text.length * 12, 1400));
      setTyping(false);
      setMessages((m) => [...m, { id: newId(), from: "juno", text }]);
      await sleep(150);
    }
  }, []);

  const addUser = (text: string, note?: string) =>
    setMessages((m) => [...m, { id: newId(), from: "user", text, note }]);

  useEffect(() => {
    if (started.current) return; // guard against React strict-mode double run
    started.current = true;
    (async () => {
      await say(
        "Hi there, I'm Juno! 👋",
        "I'll help you build your medical profile by having a quick chat — no long, boring forms. Then you can share it with a drug trial in one tap.",
        "Everything you tell me is locked and stored on this phone only. It's never saved on our servers.",
        "First things first — what would you like me to call you?",
      );
      setStage("name");
    })();
  }, [say]);

  async function handleName(text: string) {
    const clean = text.replace(/\s+/g, " ").slice(0, 40);
    addUser(clean);
    setName(clean);
    setStage("intro");
    await say(
      `Lovely to meet you, ${clean}! 😊`,
      "Next, let's set a 6-digit passcode. It locks your profile so only you can open it.",
      "Pop it into the secure box below. I can't see it, and it's never sent anywhere.",
    );
    setPadError(null);
    setStage("create");
  }

  async function handleCreate(code: string) {
    if (isWeakPasscode(code)) {
      setPadError(mkErr("That one's a bit easy to guess. Try a less predictable code."));
      return;
    }
    firstCode.current = code;
    setPadError(null);
    setStage("confirm");
  }

  async function handleConfirm(code: string) {
    if (code !== firstCode.current) {
      firstCode.current = null;
      setPadError(mkErr("Those didn't match. Let's try again from the start."));
      setStage("create");
      return;
    }
    setStage("saving");
    addUser("••••••", "Passcode set");
    try {
      await say(
        "Got it! One important thing before we go on:",
        "Because nothing is kept on our servers, if you forget your passcode I can't get your data back. You'd need to wipe it and start again. So keep it somewhere safe! 🔐",
      );
      await createAccount(name, code);
      firstCode.current = null;
      setStage("done");
      await say("All done — your profile is created, encrypted and saved on this device. ✅");
    } catch {
      firstCode.current = null;
      setStage("error");
      await say("Oops, something went wrong saving that on your device. Let's try setting the passcode again.");
      setPadError(null);
      setStage("create");
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatHeader subtitle="Setting up your account" />
      <MessageList messages={messages} typing={typing} />

      {stage === "name" && <TextComposer onSend={handleName} placeholder="Your name or a nickname" maxLength={40} />}
      {stage === "create" && (
        <PasscodePad
          title="Create a 6-digit passcode"
          subtitle="Stored only on this device. Juno never sees it."
          error={padError}
          onComplete={handleCreate}
        />
      )}
      {stage === "confirm" && (
        <PasscodePad title="Type it once more to confirm" subtitle="Just to make sure." error={padError} onComplete={handleConfirm} />
      )}
      {stage === "done" && !typing && (
        <div className="animate-slide-up border-t border-juno-100 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            onClick={onDone}
            className="w-full rounded-full bg-juno-500 py-3 font-bold text-white shadow-sm transition active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      )}
      {(stage === "intro" || stage === "saving" || stage === "error" || (stage === "done" && typing)) && (
        <div className="h-[72px] border-t border-juno-100 bg-white" />
      )}
    </div>
  );
}
