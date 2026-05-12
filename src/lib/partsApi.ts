import { supabase } from "@/lib/supabase";
import { Part, PartInput } from "@/types/part";
import { buildSearchKeywords } from "@/lib/searchParts";
import { detectBrandFromModel, normalizeBrand } from "@/constants/brands";
import { isAdminUser } from "@/lib/auth";
import {
  getLocalParts,
  upsertLocalPart,
  deleteLocalPart,
} from "@/lib/indexedDb";

function resolveBrand(input: Partial<PartInput | Part>): string {
  const rawBrand = String(input.brand || "").trim();

  if (rawBrand) {
    return normalizeBrand(rawBrand);
  }

  return detectBrandFromModel(String(input.equipment_model || ""));
}

function normalizePartPayload(input: PartInput | Part, id?: string) {
  const now = new Date().toISOString();
  const brand = resolveBrand(input);
  const existingPart = input as Part;

  return {
    id: id || existingPart.id || crypto.randomUUID(),
    brand,
    equipment_model: input.equipment_model,
    service_type: input.service_type,
    part_no: input.part_no,
    description: input.description,
    qty: String(input.qty),
    remark: input.remark || "",
    search_keywords: buildSearchKeywords({
      ...input,
      brand,
      qty: String(input.qty),
    }),
    version_id: input.version_id || null,
    is_active: input.is_active ?? true,
    created_at: existingPart.created_at || now,
    updated_at: now,
  };
}

async function fetchAllPartsByActiveStatus(isActive: boolean): Promise<Part[]> {
  if (!supabase) {
    throw new Error("Supabase belum terhubung. Cek file .env.local.");
  }

  const pageSize = 1000;
  let from = 0;
  let allData: Part[] = [];

  while (true) {
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("parts")
      .select("*")
      .eq("is_active", isActive)
      .order("brand")
      .order("equipment_model")
      .range(from, to);

    if (error) {
      console.error("Fetch parts pagination error:", error);
      throw new Error(error.message);
    }

    const batch = (data || []) as Part[];
    allData = [...allData, ...batch];

    if (batch.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return allData;
}

async function ensureAdminAccess() {
  if (!supabase) {
    throw new Error("Supabase belum terhubung. Cek file .env.local.");
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !isAdminUser(data.user || null)) {
    throw new Error("Akses ditolak. Fitur ini hanya untuk admin login.");
  }
}

export async function createPart(input: PartInput): Promise<Part> {
  await ensureAdminAccess();

  if (!supabase) {
    throw new Error("Supabase belum terhubung. Cek file .env.local.");
  }

  const payload = normalizePartPayload(input);

  const { data, error } = await supabase
    .from("parts")
    .upsert(payload, {
      onConflict: "equipment_model,service_type,part_no,description",
    })
    .select()
    .single();

  if (error) {
    console.error("Create part error detail:", error);
    throw new Error(
      error.message || JSON.stringify(error) || "Gagal tambah data."
    );
  }

  await upsertLocalPart(data as Part);
  return data as Part;
}

export async function fetchRemoteParts(): Promise<Part[]> {
  return fetchAllPartsByActiveStatus(true);
}

export async function getPartById(id: string): Promise<Part | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from("parts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Get part error:", error);
    }

    if (data) {
      return data as Part;
    }
  }

  const localParts = await getLocalParts();
  return localParts.find((part) => part.id === id) || null;
}

export async function updatePart(id: string, input: PartInput): Promise<Part> {
  await ensureAdminAccess();

  if (!supabase) {
    throw new Error("Supabase belum terhubung. Cek file .env.local.");
  }

  const brand = resolveBrand(input);
  const now = new Date().toISOString();

  const payload = {
    brand,
    equipment_model: input.equipment_model,
    service_type: input.service_type,
    part_no: input.part_no,
    description: input.description,
    qty: String(input.qty),
    remark: input.remark || "",
    version_id: input.version_id || null,
    is_active: input.is_active ?? true,
    search_keywords: buildSearchKeywords({
      ...input,
      brand,
      qty: String(input.qty),
    }),
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("parts")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update part error:", error);
    throw new Error(error.message);
  }

  await upsertLocalPart(data as Part);
  return data as Part;
}

export async function publishPartsToSupabase(parts: Part[]): Promise<Part[]> {
  await ensureAdminAccess();

  if (!supabase) {
    throw new Error("Supabase belum terhubung. Cek file .env.local.");
  }

  const payload = parts.map((part) => normalizePartPayload(part, part.id));

  const { data, error } = await supabase
    .from("parts")
    .upsert(payload, {
      onConflict: "equipment_model,service_type,part_no,description",
    })
    .select();

  if (error) {
    console.error("Supabase upload error detail:", error);
    throw new Error(
      error.message || JSON.stringify(error) || "Gagal upload ke Supabase."
    );
  }

  const savedParts = (data || []) as Part[];

  for (const part of savedParts) {
    await upsertLocalPart(part);
  }

  return savedParts;
}

export async function deletePartPermanent(id: string): Promise<void> {
  await ensureAdminAccess();

  if (!supabase) {
    throw new Error("Supabase belum terhubung. Cek file .env.local.");
  }

  const { error } = await supabase.from("parts").delete().eq("id", id);

  if (error) {
    console.error("Delete part error:", error);
    throw new Error(error.message);
  }

  await deleteLocalPart(id);
}

export async function deactivatePart(id: string): Promise<void> {
  await ensureAdminAccess();

  if (!supabase) {
    throw new Error("Supabase belum terhubung. Cek file .env.local.");
  }

  const { error } = await supabase
    .from("parts")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Deactivate part error:", error);
    throw new Error(error.message);
  }

  await deleteLocalPart(id);
}

export async function fetchInactiveParts(): Promise<Part[]> {
  await ensureAdminAccess();
  return fetchAllPartsByActiveStatus(false);
}

export async function activatePart(id: string): Promise<Part> {
  await ensureAdminAccess();

  if (!supabase) {
    throw new Error("Supabase belum terhubung. Cek file .env.local.");
  }

  const { data, error } = await supabase
    .from("parts")
    .update({
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Activate part error:", error);
    throw new Error(error.message);
  }

  await upsertLocalPart(data as Part);

  return data as Part;
}