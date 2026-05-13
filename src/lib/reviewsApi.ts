import { supabase } from "@/lib/supabase";
import { ReviewInput, ReviewUpdateInput, UserReview } from "@/types/review";

export async function createUserReview(input: ReviewInput): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase belum terhubung. Cek file .env.local.");
  }

  const payload = {
    sender_name: input.sender_name?.trim() || null,
    sender_role: input.sender_role?.trim() || null,
    rating: input.rating || 5,
    review_text: input.review_text.trim(),
    is_visible: false,
  };

  const { error } = await supabase.from("user_reviews").insert(payload);

  if (error) {
    console.error("Create review error:", error);
    throw new Error(error.message || "Gagal mengirim ulasan.");
  }
}

export async function fetchVisibleReviews(): Promise<UserReview[]> {
  if (!supabase) {
    throw new Error("Supabase belum terhubung. Cek file .env.local.");
  }

  const { data, error } = await supabase
    .from("user_reviews")
    .select("*")
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Fetch visible reviews error:", error);
    throw new Error(error.message || "Gagal mengambil ulasan.");
  }

  return (data || []) as UserReview[];
}

export async function fetchAllReviews(): Promise<UserReview[]> {
  if (!supabase) {
    throw new Error("Supabase belum terhubung. Cek file .env.local.");
  }

  const { data, error } = await supabase
    .from("user_reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch all reviews error:", error);
    throw new Error(error.message || "Gagal mengambil semua ulasan.");
  }

  return (data || []) as UserReview[];
}

export async function updateUserReview(
  id: string,
  input: ReviewUpdateInput
): Promise<UserReview> {
  if (!supabase) {
    throw new Error("Supabase belum terhubung. Cek file .env.local.");
  }

  const { data, error } = await supabase
    .from("user_reviews")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update review error:", error);
    throw new Error(error.message || "Gagal mengubah ulasan.");
  }

  return data as UserReview;
}