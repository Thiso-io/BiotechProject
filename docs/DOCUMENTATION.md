# Juno – Project Documentation

Juno is a friendly voice assistant that interviews a patient and builds a structured medical profile. The profile is encrypted and kept **only on the patient's device**, ready to share with a drug trial later.

Hackathon theme: speeding up the new drug trial process.

> Demo only. Use fake data. Juno never gives medical advice.

Slides: [`docs/Juno-pitch.pptx`](Juno-pitch.pptx) · Screenshots: [`docs/screenshots/`](screenshots/)

## 1. Running it

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY=...
npm run dev
```

Open http://localhost:3000 in Chrome.

- **Without an API key**, `/api/chat` falls back to a scripted interviewer (`lib/mock-interviewer.ts`), so the demo still works offline.
- **The mic and Web Crypto** need `localhost` or HTTPS. To use a phone on the same Wi-Fi, run `npm run dev -- --experimental-https`.

## 2. User flow

1. **Welcome.** Tap "Start talking".
2. **Name.** Juno asks for the patient's name, spoken or typed.
3. **PIN.** A secure keypad appears for a 6-digit PIN, entered twice. Weak PINs such as `111111` or `123456` are rejected. The PIN is never sent to the chat, the mic, the server or the AI.
4. **Account.** An encrypted account is created on the device. Juno warns that a forgotten PIN means the data can't be recovered.
5. **Interview.** Juno works through 8 sections, one short question at a time. The patient can answer "I'm not sure" or skip.
   1. About you
   2. Contact details
   3. Health conditions
   4. Medicines
   5. Allergies
   6. Operations & hospital stays
   7. Family health
   8. Lifestyle
6. **Review card.** After each section the patient checks what Juno heard and can edit it. "Looks good" saves it encrypted.
7. **Lock and resume.** The lock button closes the vault. Unlocking with the PIN resumes at the next unfinished section. After 5 wrong PINs there is a 30-second cooldown. "Forgot PIN" wipes all data.

## 3. Architecture

```
Phone (browser / PWA)                         Server                 Anthropic
┌───────────────────────────────┐   current   ┌──────────────┐       ┌────────────────────┐
│ Voice UI (Web Speech API)     │   section   │ /api/chat    │──────▶│ claude-sonnet-5-5  │
│ PIN → PBKDF2 → AES-GCM key    │────turns───▶│ stateless,   │◀──────│ structured JSON    │
│ Encrypted profile (IndexedDB) │◀──reply─────│ no logging   │       └────────────────────┘
└───────────────────────────────┘             └──────────────┘
```

- **Encryption.** The key comes from the PIN via PBKDF2-SHA256 (600,000 iterations, random 16-byte salt). It is a non-extractable AES-GCM-256 key, and every save uses a fresh 12-byte IV. The key lives only in memory while the app is unlocked.
- **Storage.** IndexedDB (`juno` database, `vault` store) holds only the salt, IV and ciphertext.
- **AI calls.** Each call sends only the current section's last turns, its draft answers, and the patient's first name, never the whole profile. Claude returns `{ reply, extracted, section_complete, safety }`, and the server validates it against the Zod schemas in `lib/schema.ts`.
- **Server route.** It doesn't store or log message content. Errors are logged by status code only. If the AI fails, the patient sees a friendly error and a Retry button, and saved data is untouched.
- **Safety.**
  - `lib/safety.ts` catches emergency phrases on the device before any AI call. Juno then shows 999, A&E and NHS 111, plus Samaritans (116 123) if self-harm is mentioned.
  - Claude also flags `safety: "emergency"` or `"medical_advice"`.

## 4. Code map

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Chooses the lock screen or the conversation |
| `app/api/chat/route.ts` | Stateless Claude route (with the offline fallback) |
| `components/Conversation.tsx` | The whole voice conversation flow and its stages |
| `components/voice-ui.tsx` | Top bar, captions, hold-to-talk dock, transcript, emergency sheet |
| `components/Orb.tsx` | Animated Juno orb (idle / listening / thinking / speaking) |
| `components/Keypad.tsx` | Secure 6-digit PIN keypad |
| `components/ReviewCard.tsx` | Editable section review card |
| `components/LockScreen.tsx` | Unlock, cooldown, "Forgot PIN" wipe |
| `lib/schema.ts` | Section schemas, profile type, merge logic, Claude output format |
| `lib/juno-prompt.ts` | Juno's personality and rules (system prompt) |
| `lib/voice.ts` | Speech recognition and speech synthesis hooks |
| `lib/crypto.ts`, `lib/db.ts`, `lib/vault.tsx` | Encryption, IndexedDB storage, vault state |
| `lib/safety.ts` | On-device emergency detection |
| `lib/mock-interviewer.ts` | Scripted interviewer used when there is no API key |

## 5. Tech stack

- Next.js 15 (App Router), React 19, TypeScript and Tailwind CSS 4. It installs as a PWA.
- Anthropic TypeScript SDK with structured outputs, plus Zod.
- Web Speech API for voice, and Web Crypto with IndexedDB (`idb`) for storage.

## 6. Roadmap

- [x] Step 1: account set up through the chat, encrypted vault, lock screen
- [x] Step 2: voice interview across 8 sections, review cards, resume
- [ ] Step 3: My Health Card page (view, edit, "Ask Juno to update", delete all)
- [ ] Step 4: share with a trial by QR code, plus a scanner page for trial staff
- [ ] Step 5: demo mode with a fake patient

## 7. Known limits

- Chrome's speech recognition sends audio to Google to transcribe it. Typing avoids this.
- A forgotten PIN can't be recovered; this is deliberate.
- The real Claude conversation needs `ANTHROPIC_API_KEY` in `.env.local`.
