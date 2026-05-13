"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import AdminGuard from "@/components/AdminGuard";
import {
  fetchSuggestions,
  updateSuggestionStatus,
} from "@/lib/suggestionsApi";
import { SuggestionStatus, UserSuggestion } from "@/types/suggestion";

const statuses: SuggestionStatus[] = ["baru", "ditinjau", "selesai"];

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"semua" | SuggestionStatus>(
    "semua"
  );

  useEffect(() => {
    loadSuggestions();
  }, []);

  async function loadSuggestions() {
    try {
      setMessage("");
      const data = await fetchSuggestions();
      setSuggestions(data);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal memuat saran."
      );
    }
  }

  async function onStatusChange(id: string, status: SuggestionStatus) {
    try {
      setProcessingId(id);
      await updateSuggestionStatus(id, status);

      setSuggestions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal mengubah status."
      );
    } finally {
      setProcessingId(null);
    }
  }

  const filteredSuggestions =
    filterStatus === "semua"
      ? suggestions
      : suggestions.filter((item) => item.status === filterStatus);

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <PageHeader
        title="Saran User"
        subtitle="Halaman ini hanya untuk admin membaca dan mengubah status saran."
      />

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/parts"
            className="block rounded-2xl border border-[#D6DCE5] bg-white px-4 py-3 text-center text-sm font-bold text-[#0B1E3A] shadow-sm"
          >
            Kembali ke Data Part
          </Link>

          <Link
            href="/suggest"
            className="block rounded-2xl border border-[#D6DCE5] bg-white px-4 py-3 text-center text-sm font-bold text-[#0B1E3A] shadow-sm"
          >
            Buka Form Saran User
          </Link>
        </div>

        <AdminGuard title="Daftar saran user">
          {message ? (
            <p className="rounded-xl border border-[#EED98A] bg-[#FFF8D9] p-3 text-sm text-[#334155]">
              {message}
            </p>
          ) : null}

          <div className="rounded-2xl border border-[#D6DCE5] bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-[#0B1E3A]">
              Total saran: {suggestions.length}
            </p>

            <div className="mt-3">
              <label className="block text-sm font-semibold text-[#0B1E3A]">
                Filter Status
                <select
                  value={filterStatus}
                  onChange={(event) =>
                    setFilterStatus(
                      event.target.value as "semua" | SuggestionStatus
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-[#D6DCE5] bg-[#F8FAFC] px-3 py-3 text-sm text-[#0B1E3A] outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1E3A]"
                >
                  <option value="semua">Semua</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            {filteredSuggestions.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#D6DCE5] bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#64748B]">
                      {item.suggestion_type === "perbaikan_data"
                        ? "Perbaikan Data"
                        : "Tambahan Data"}
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString("id-ID")
                        : "-"}
                    </p>
                  </div>

                  <select
                    value={item.status}
                    disabled={processingId === item.id}
                    onChange={(event) =>
                      onStatusChange(
                        item.id,
                        event.target.value as SuggestionStatus
                      )
                    }
                    className="rounded-lg border border-[#D6DCE5] px-2 py-1 text-xs font-semibold text-[#0B1E3A]"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 rounded-xl bg-[#F8FAFC] p-3">
                  <p className="text-xs font-bold uppercase text-[#64748B]">
                    Isi Saran
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-[#0B1E3A]">
                    {item.suggestion_text}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                  <InfoRow label="Model" value={item.equipment_model || "-"} />
                  <InfoRow label="Service" value={item.service_type || "-"} />
                  <InfoRow label="Part No" value={item.part_no || "-"} />
                  <InfoRow
                    label="Deskripsi Saat Ini"
                    value={item.current_description || "-"}
                  />
                  <InfoRow
                    label="Nama Pengirim"
                    value={item.sender_name || "-"}
                  />
                  <InfoRow
                    label="Kontak Pengirim"
                    value={item.sender_contact || "-"}
                  />
                  <InfoRow
                    label="Catatan Admin"
                    value={item.admin_note || "-"}
                  />
                </div>

                {processingId === item.id ? (
                  <p className="mt-3 rounded-xl bg-[#FFF8D9] p-3 text-xs text-[#334155]">
                    Memproses perubahan status...
                  </p>
                ) : null}
              </div>
            ))}

            {!filteredSuggestions.length ? (
              <p className="rounded-xl border border-[#D6DCE5] bg-white p-4 text-sm text-[#64748B]">
                Belum ada saran masuk untuk filter ini.
              </p>
            ) : null}
          </div>
        </AdminGuard>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
      <p className="text-xs font-bold uppercase text-[#64748B]">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#0B1E3A]">
        {value}
      </p>
    </div>
  );
}