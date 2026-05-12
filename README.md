# Parts Finder PWA

Starter project PWA mobile-friendly untuk pencarian data part service teknisi.

## Fitur awal

- Cari part dari data offline
- Pin/favorit part
- Tambah data manual per kolom
- Upload Excel template
- Sinkron data dari Supabase/PostgreSQL
- IndexedDB untuk offline storage

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Setup Supabase

1. Buat project Supabase.
2. Jalankan SQL di `database/schema.sql`.
3. Copy `.env.example` menjadi `.env.local`.
4. Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Format Excel

Sheet: `MASTER_PARTS`

Kolom wajib:

- equipment_model
- service_type
- part_no
- description
- qty

Kolom opsional:

- remark
