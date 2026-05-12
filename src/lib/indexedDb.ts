import { openDB } from "idb";
import { Part } from "@/types/part";

const DB_NAME = "parts-finder-db";
const DB_VERSION = 1;

export async function db() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains("parts"))
        database.createObjectStore("parts", { keyPath: "id" });

      if (!database.objectStoreNames.contains("pinned"))
        database.createObjectStore("pinned", { keyPath: "id" });

      if (!database.objectStoreNames.contains("meta"))
        database.createObjectStore("meta");
    },
  });
}

export async function getLocalParts(): Promise<Part[]> {
  return (await db()).getAll("parts");
}

export async function saveLocalParts(parts: Part[]) {
  const database = await db();
  const tx = database.transaction("parts", "readwrite");
  await tx.store.clear();

  for (const part of parts) {
    await tx.store.put(part);
  }

  await tx.done;
}

export async function upsertLocalPart(part: Part) {
  return (await db()).put("parts", part);
}

export async function deleteLocalPart(id: string): Promise<void> {
  const database = await db();
  await database.delete("parts", id);
}