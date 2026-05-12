import { supabase } from "@/lib/supabase";
import { isAdminUser } from "@/lib/auth";
import {
  SuggestionInput,
  SuggestionStatus,
  UserSuggestion,
} from "@/types/suggestion";

const TABLE_NAME = "user_suggestions";

function ensureSupabase() {
  if (!supabase) {
    throw new Error("Supabase belum terhubung. Cek file .env.local.");
  }
}

async function ensureAdminAccess() {
  ensureSupabase();

  const { data, error } = await supabase!.auth.getUser();

  if (error || !isAdminUser(data.user || null)) {
    throw new Error("Akses ditolak. Halaman ini hanya untuk admin login.");
  }
}

export async function createSuggestion(input: SuggestionInput) {
  ensureSupabase();

  const payload = {
    suggestion_type: input.suggestion_type,
    status: "baru",
    equipment_model: input.equipment_model || null,
    service_type: input.service_type || null,
    part_no: input.part_no || null,
    current_description: input.current_description || null,
    suggestion_text: input.suggestion_text,
    sender_name: input.sender_name || null,
    sender_contact: input.sender_contact || null,
  };

  const { error } = await supabase!.from(TABLE_NAME).insert(payload);

  if (error) {
    throw new Error(error.message || "Gagal mengirim saran.");
  }
}

export async function fetchSuggestions(): Promise<UserSuggestion[]> {
  await ensureAdminAccess();

  const { data, error } = await supabase!
    .from(TABLE_NAME)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Gagal mengambil saran.");
  }

  return (data || []) as UserSuggestion[];
}

export async function updateSuggestionStatus(
  id: string,
  status: SuggestionStatus,
  adminNote?: string
) {
  await ensureAdminAccess();

  const { error } = await supabase!
    .from(TABLE_NAME)
    .update({
      status,
      admin_note: adminNote || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Gagal mengubah status saran.");
  }
}
