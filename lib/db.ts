// Local storage on the patient's device (IndexedDB). Nothing here is ever sent to a server.
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Bytes } from "./crypto";

export type VaultRecord = {
  version: 1;
  salt: Bytes;
  iterations: number;
  iv: Bytes;
  ciphertext: ArrayBuffer; // the encrypted Profile
  createdAt: string;
};

interface JunoDB extends DBSchema {
  vault: { key: string; value: VaultRecord };
}

const DB_NAME = "juno";
const VAULT_KEY = "profile";

let dbPromise: Promise<IDBPDatabase<JunoDB>> | null = null;

function getDB() {
  dbPromise ??= openDB<JunoDB>(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore("vault");
    },
  });
  return dbPromise;
}

export async function getVault(): Promise<VaultRecord | undefined> {
  return (await getDB()).get("vault", VAULT_KEY);
}

export async function putVault(record: VaultRecord): Promise<void> {
  await (await getDB()).put("vault", record, VAULT_KEY);
}

/** Permanently delete everything Juno has stored on this device. */
export async function wipeAll(): Promise<void> {
  await (await getDB()).clear("vault");
}
