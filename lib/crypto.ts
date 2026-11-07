// Client-side encryption helpers. Runs ONLY in the browser.
// The passcode and the derived key never leave the device.

export const PBKDF2_ITERATIONS = 600_000; // OWASP 2023 recommendation for PBKDF2-SHA256

export type Bytes = Uint8Array<ArrayBuffer>;

export function randomBytes(length: number): Bytes {
  return crypto.getRandomValues(new Uint8Array(length));
}

/** Turn a passcode + salt into an AES-GCM key. The key is non-extractable. */
export async function deriveKey(
  passcode: string,
  salt: Bytes,
  iterations = PBKDF2_ITERATIONS,
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passcode),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptJSON(
  key: CryptoKey,
  data: unknown,
): Promise<{ iv: Bytes; ciphertext: ArrayBuffer }> {
  const iv = randomBytes(12); // fresh IV for every save
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return { iv, ciphertext };
}

/** Throws if the key is wrong (AES-GCM authentication fails). */
export async function decryptJSON<T>(key: CryptoKey, iv: Bytes, ciphertext: ArrayBuffer): Promise<T> {
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}
