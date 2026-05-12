"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import {
  deactivatePart,
  deletePartPermanent,
  fetchRemoteParts,
} from "@/lib/partsApi";
import { Part } from "@/types/part";
import AdminGuard from "@/components/AdminGuard";

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadParts() {
      try {
        const data = await fetchRemoteParts();
        setParts(data);
      } catch (error: any) {
        console.error(error);
        setMessage(error.message || "Gagal mengambil data.");
      }
    }

    loadParts();
  }, []);

  async function handleDeactivate(part: Part) {
    const confirmed = window.confirm(
      `Yakin ingin menonaktifkan data ini?\n\n${part.equipment_model} - ${part.service_type}\n${part.part_no} - ${part.description}\n\nData akan hilang dari aplikasi/search, tetapi tetap tersimpan di database pusat sebagai arsip.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(part.id);
      setMessage("");

      await deactivatePart(part.id);

      setParts((prev) => prev.filter((item) => item.id !== part.id));
      setMessage("Data berhasil dinonaktifkan.");
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Gagal menonaktifkan data.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(part: Part) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus permanen data ini?\n\n${part.equipment_model} - ${part.service_type}\n${part.part_no} - ${part.description}\n\nData akan hilang dari database pusat dan data offline lokal.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(part.id);
      setMessage("");

      await deletePartPermanent(part.id);

      setParts((prev) => prev.filter((item) => item.id !== part.id));
      setMessage("Data berhasil dihapus permanen.");
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Gagal menghapus data.");
    } finally {
      setProcessingId(null);
    }
  }

  const filtered = parts.filter((part) => {
    const keyword = query.toLowerCase();

    return [
      part.equipment_model,
      part.service_type,
      part.part_no,
      part.description,
      part.qty,
      part.remark,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <PageHeader
        title="Data Part Service"
        subtitle="Kelola data part service"
      />

      <div className="space-y-4 p-4">
        <AdminGuard title="Kelola data part">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#D6DCE5] bg-white px-3 py-2 text-sm font-semibold text-[#0B1E3A] shadow-sm transition hover:border-[#0B1E3A]"
        >
          Kembali ke Menu Utama
        </Link>

        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/parts/add"
            className="block rounded-2xl border border-[#0B1E3A] bg-[#0B1E3A] px-4 py-4 text-center text-sm font-bold text-white shadow-sm"
            style={{ color: "white" }}
          >
            + Tambah Data Manual
          </Link>

          <Link
            href="/parts/inactive"
            className="block rounded-2xl border border-[#D6DCE5] bg-white px-4 py-4 text-center text-sm font-bold text-[#0B1E3A] shadow-sm"
          >
            Lihat Data Nonaktif
          </Link>

          <Link
            href="/admin/suggestions"
            className="block rounded-2xl border border-[#D6DCE5] bg-white px-4 py-4 text-center text-sm font-bold text-[#0B1E3A] shadow-sm"
          >
            Lihat Saran User
          </Link>
        </div>

        <div className="rounded-2xl border border-[#D6DCE5] bg-white p-3 shadow-sm">
          <input
            className="w-full rounded-xl border border-[#D6DCE5] bg-[#F8FAFC] px-3 py-3 text-sm text-[#0B1E3A] outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1E3A]"
            placeholder="Cari model, part no, description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {message ? (
          <p className="rounded-2xl border border-[#EED98A] bg-[#FFF8D9] p-3 text-sm font-medium text-[#334155]">
            {message}
          </p>
        ) : null}

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#0B1E3A]">
            Total data tampil: {filtered.length}
          </p>

          {filtered.length > 100 ? (
            <p className="text-xs text-[#64748B]">Tampil 100 pertama</p>
          ) : null}
        </div>

        <div className="space-y-3">
          {filtered.slice(0, 100).map((part) => (
            <div
              key={part.id}
              className="rounded-2xl border border-[#D6DCE5] bg-white p-4 shadow-sm"
            >
              <div className="space-y-3">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#FFF8D6] px-3 py-1 text-xs font-semibold text-[#0B1E3A]">
                      {part.equipment_model}
                    </span>

                    <span className="rounded-full bg-[#EAF0F7] px-3 py-1 text-xs font-semibold text-[#1E3354]">
                      {part.service_type}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-bold leading-snug text-[#0B1E3A]">
                    {part.description}
                  </h3>

                  <p className="mt-2 text-sm text-[#334155]">
                    Part No:{" "}
                    <span className="font-bold text-[#0B1E3A]">
                      {part.part_no}
                    </span>
                  </p>

                  <p className="text-sm text-[#334155]">
                    Qty:{" "}
                    <span className="font-bold text-[#0B1E3A]">{part.qty}</span>
                  </p>

                  {part.remark ? (
                    <p className="text-sm text-[#64748B]">
                      Remark: {part.remark}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href={`/parts/edit/${part.id}`}
                    className="rounded-xl bg-[#0B1E3A] px-3 py-3 text-center text-sm font-bold text-white"
                    style={{ color: "white" }}
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDeactivate(part)}
                    disabled={processingId === part.id}
                    className="rounded-xl bg-[#F7C600] px-3 py-3 text-sm font-bold text-[#0B1E3A] disabled:opacity-50"
                  >
                    {processingId === part.id ? "..." : "Nonaktif"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(part)}
                    disabled={processingId === part.id}
                    className="rounded-xl bg-[#B91C1C] px-3 py-3 text-sm font-bold text-white disabled:opacity-50"
                    style={{ color: "white" }}
                  >
                    {processingId === part.id ? "..." : "Hapus"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#D6DCE5] bg-white p-5 text-center shadow-sm">
            <p className="font-bold text-[#0B1E3A]">Data tidak ditemukan</p>
            <p className="mt-2 text-sm text-[#64748B]">
              Coba gunakan kata kunci lain.
            </p>
          </div>
        ) : null}

        {filtered.length > 100 ? (
          <p className="pb-4 text-center text-xs text-[#64748B]">
            Hasil terlalu banyak. Gunakan pencarian agar lebih spesifik.
          </p>
        ) : null}
        </AdminGuard>
      </div>
    </div>
  );
}