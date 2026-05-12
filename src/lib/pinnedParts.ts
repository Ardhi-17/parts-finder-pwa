import { db } from "@/lib/indexedDb";
import { Part } from "@/types/part";

export async function getPinnedParts(): Promise<Part[]> {
  return (await db()).getAll("pinned");
}

export async function isPinned(id: string) {
  return Boolean(await (await db()).get("pinned", id));
}

export async function togglePinned(part: Part): Promise<boolean> {
  const database = await db();
  const found = await database.get("pinned", part.id);
  if (found) {
    await database.delete("pinned", part.id);
    return false;
  }
  await database.put("pinned", part);
  return true;
}
