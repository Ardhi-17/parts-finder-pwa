"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import AdminGuard from "@/components/AdminGuard";
import { activatePart, fetchInactiveParts } from "@/lib/partsApi";
import { Part } from "@/types/part";

export default function InactivePartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadParts();
  }, []);

  async function loadParts() {
    try {
      const data = await fetchInactiveParts();
      setParts(data);
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Gagal mengambil data nonaktif.");
    }
  }

  async function handleActivate(part: Part) {
    const confirmed = window.confirm(
      `Aktifkan kembali data ini?\n\n${part.equipment_model} - ${part.service_type}\n${part.part_no} - ${part.description}\n\nData akan muncul kembali di aplikasi/search.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(part.id);
      setMessage("");

      await activatePart(part.id);

      setParts((prev) => prev.filter((item) => item.id !== part.id));
      setMessage("Data berhasil diaktifkan kembali.");
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Gagal mengaktifkan data.");
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
    <div>
      <PageHeader
        title="Data Nonaktif"
        subtitle="Aktifkan kembali data yang sebelumnya dinonaktifkan."
      />

      <div className="space-y-4 p-4">
        <AdminGuard title="Data nonaktif">
        <Link
          href="/parts"
          className="block rounded-xl border px-4 py-3 text-center font-semibold"
        >
          Kembali ke Data Aktif
        </Link>

        <input
          className="w-full rounded-xl border px-3 py-3 outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Cari data nonaktif..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {message ? (
          <p className="rounded-xl bg-gray-100 p-3 text-sm text-gray-700">
            {message}
          </p>
        ) : null}

        <p className="text-sm text-gray-500">
          Total data nonaktif: {filtered.length}
        </p>

        <div className="space-y-3">
          {filtered.slice(0, 100).map((part) => (
            <div
              key={part.id}
              className="rounded-2xl border bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold text-gray-500">
                {part.equipment_model} • {part.service_type}
              </p>

              <h3 className="mt-1 font-semibold text-gray-900">
                {part.description}
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                Part No: <span className="font-medium">{part.part_no}</span>
              </p>

              <p className="text-sm text-gray-600">Qty: {part.qty}</p>

              {part.remark ? (
                <p className="text-sm text-gray-500">Remark: {part.remark}</p>
              ) : null}

              <button
                onClick={() => handleActivate(part)}
                disabled={processingId === part.id}
                className="mt-3 w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {processingId === part.id ? "Memproses..." : "Aktifkan Lagi"}
              </button>
            </div>
          ))}
        </div>

        {filtered.length > 100 ? (
          <p className="text-center text-xs text-gray-500">
            Menampilkan 100 data pertama. Gunakan pencarian agar lebih spesifik.
          </p>
        ) : null}
        </AdminGuard>
      </div>
    </div>
  );
}