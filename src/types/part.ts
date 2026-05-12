export type Part = {
  id: string;
  brand?: string;
  equipment_model: string;
  service_type: string;
  part_no: string;
  description: string;
  qty: number | string;
  remark?: string;
  search_keywords?: string;
  version_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PartInput = {
  brand?: string;
  equipment_model: string;
  service_type: string;
  part_no: string;
  description: string;
  qty: number | string;
  remark?: string;
  version_id?: string;
  is_active?: boolean;
};