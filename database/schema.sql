create table if not exists parts (
  id text primary key,
  equipment_model text not null,
  service_type text not null,
  part_no text not null,
  description text not null,
  qty text,
  remark text,
  search_keywords text,
  version_id text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists data_versions (
  id text primary key,
  version_name text not null,
  published_at timestamptz default now(),
  published_by text,
  total_rows integer default 0,
  status text default 'active'
);

create table if not exists upload_logs (
  id text primary key,
  file_name text not null,
  uploaded_at timestamptz default now(),
  uploaded_by text,
  total_rows integer default 0,
  valid_rows integer default 0,
  error_rows integer default 0,
  status text,
  notes text
);
