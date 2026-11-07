# Juno

A friendly AI assistant that chats with patients to build their medical profile for drug trials.
Everything is encrypted and stored **on the patient's device** — never on our server.

> Hackathon demo. Fake data only, not for real medical use.

## Run it

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY (needed from Step 2)
npm run dev
```

Open http://localhost:3000 (Web Crypto only works on `localhost` or HTTPS — to test on a phone over Wi-Fi, use `npm run dev -- --experimental-https`).

## How it's built

| File | What it does |
| --- | --- |
| `lib/crypto.ts` | PBKDF2 (600k iterations, random 16-byte salt) → AES-GCM-256 key; encrypt/decrypt JSON |
| `lib/db.ts` | IndexedDB (via `idb`): one encrypted vault record |
| `lib/vault.tsx` | React context: create account, unlock, lock, save, wipe. Key only ever in memory |
| `lib/schema.ts` | The `Profile` type |
| `components/Onboarding.tsx` | Scripted setup chat with Juno (name → passcode) |
| `components/PasscodePad.tsx` | Secure 6-digit input — never shown in chat, never sent anywhere |
| `components/LockScreen.tsx` | Unlock, 30s cooldown after 5 wrong tries, "forgot passcode = wipe" |
