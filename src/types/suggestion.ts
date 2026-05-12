export type SuggestionStatus = "baru" | "ditinjau" | "selesai";
export type SuggestionType = "perbaikan_data" | "tambahan_data";

export type UserSuggestion = {
  id: string;
  suggestion_type: SuggestionType;
  status: SuggestionStatus;
  equipment_model?: string;
  service_type?: string;
  part_no?: string;
  current_description?: string;
  suggestion_text: string;
  sender_name?: string;
  sender_contact?: string;
  admin_note?: string;
  created_at?: string;
  updated_at?: string;
};

export type SuggestionInput = {
  suggestion_type: SuggestionType;
  equipment_model?: string;
  service_type?: string;
  part_no?: string;
  current_description?: string;
  suggestion_text: string;
  sender_name?: string;
  sender_contact?: string;
};
