import { Part } from "@/types/part";

export function buildSearchKeywords(part: Partial<Part>) {
  return [part.equipment_model, part.service_type, part.part_no, part.description, part.remark]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function searchParts(parts: Part[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return parts;
  const tokens = q.split(/\s+/).filter(Boolean);
  return parts.filter((part) => {
    const haystack = part.search_keywords || buildSearchKeywords(part);
    return tokens.every((token) => haystack.includes(token));
  });
}
