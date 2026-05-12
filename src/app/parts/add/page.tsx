"use client";

import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PartForm from "@/components/PartForm";
import AdminGuard from "@/components/AdminGuard";
import { createPart } from "@/lib/partsApi";
import { PartInput } from "@/types/part";

export default function AddPartPage() {
  async function handleSubmit(input: PartInput): Promise<void> {
    await createPart(input);
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <PageHeader
        title="Tambah Part"
        subtitle="Isi data per kolom agar format data aman."
      />

      <AdminGuard title="Tambah data manual">
        <div className="space-y-4 p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#D6DCE5] bg-white px-3 py-2 text-sm font-semibold text-[#0B1E3A] shadow-sm transition hover:border-[#0B1E3A]"
        >
          Kembali ke Menu Utama
        </Link>
        </div>
        <PartForm onSubmit={handleSubmit} />
      </AdminGuard>
    </div>
  );
}