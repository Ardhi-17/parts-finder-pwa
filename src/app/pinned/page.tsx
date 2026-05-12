"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import PartCard from "@/components/PartCard";
import { getPinnedParts } from "@/lib/pinnedParts";
import { Part } from "@/types/part";
import { ArrowLeft, Star } from "lucide-react";

export default function PinnedPage() {
  const [parts, setParts] = useState<Part[]>([]);
  useEffect(() => { getPinnedParts().then(setParts); }, []);
  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <PageHeader title="Pinned" subtitle="Part yang sering dipakai teknisi." />

      <div className="space-y-4 p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#D6DCE5] bg-white px-3 py-2 text-sm font-semibold text-[#0B1E3A] shadow-sm transition hover:border-[#0B1E3A]"
        >
          <ArrowLeft size={16} />
          Kembali ke Menu Utama
        </Link>

        <div className="overflow-hidden rounded-2xl border border-[#E5C34A] bg-[#FFFDF4] shadow-sm">
          <div className="h-1.5 bg-[#F7C600]" />
          <div className="flex items-center gap-3 p-4">
            <div className="rounded-xl bg-[#0B1E3A] p-2 text-[#F7C600]">
              <Star size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0B1E3A]">Favorit</p>
              <p className="text-xs text-[#475569]">{parts.length} data tersimpan</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {parts.length ? (
            parts.map((p) => <PartCard key={p.id} part={p} />)
          ) : (
            <div className="rounded-2xl border border-[#D6DCE5] bg-white p-5 text-center shadow-sm">
              <p className="font-bold text-[#0B1E3A]">Belum ada data favorit</p>
              <p className="mt-1 text-sm text-[#64748B]">Tambahkan data dari halaman pencarian.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
