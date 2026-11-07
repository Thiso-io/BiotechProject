# Juno

A friendly voice assistant that talks with patients to build their medical profile for drug trials.
Everything is encrypted and stored **on the patient's device** — never on our server.

> Hackathon demo. Fake data only, not for real medical use.

## Run it

```bash
npm install
cp .env.example .env.local   # then paste your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000 in **Chrome** (best voice support). Web Crypto and the mic only work on `localhost` or HTTPS — to try it on a phone over Wi-Fi, use `npm run dev -- --experimental-https`.

**No API key?** The app still works: `/api/chat` falls back to a simple scripted interviewer so you can demo offline. Add the key for the real Claude-powered conversation.

## How it works

- **Voice first.** Hold the mic to talk (Web Speech API), or type. Juno replies out loud (speech synthesis) and as captions. The mute button turns the voice off.
- **Sign-up in the conversation.** Juno asks your name, then a secure keypad pops up for a 6-digit PIN. The PIN never goes into the chat, the mic or the AI.
- **AI interview** (`app/api/chat/route.ts`, model `claude-sonnet-5-5`). Each turn returns structured JSON `{ reply, extracted, section_complete, safety }` validated against the Zod schemas in `lib/schema.ts`. Only the current section's recent turns and draft are sent, never the whole profile. The route stores and logs nothing.
- **Review cards.** After each section Juno shows what it heard; tap to edit, then "Looks good" saves it (encrypted). Leave any time — you'll resume at the next unfinished section.
- **Safety.** Emergency phrases are caught on the device before anything is sent, and Claude flags them too: Juno stops and shows 999 / A&E / NHS 111 (and Samaritans for self-harm).

| File | What it does |
| --- | --- |
| `components/Conversation.tsx` | The whole voice conversation flow |
| `components/Orb.tsx`, `voice-ui.tsx`, `Keypad.tsx`, `ReviewCard.tsx` | UI pieces |
| `lib/voice.ts` | Hold-to-talk speech recognition + text-to-speech |
| `lib/schema.ts` | Profile + section schemas (also Claude's output format) |
| `lib/juno-prompt.ts` | Juno's personality and rules |
| `lib/crypto.ts`, `lib/db.ts`, `lib/vault.tsx` | PBKDF2 + AES-GCM encryption, IndexedDB storage |

Note: Chrome's speech recognition sends audio to Google to transcribe it. Typing avoids that.
