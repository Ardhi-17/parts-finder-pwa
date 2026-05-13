"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import AdminGuard from "@/components/AdminGuard";
import {
  fetchSuggestions,
  updateSuggestionStatus,
} from "@/lib/suggestionsApi";
import { SuggestionStatus, UserSuggestion } from "@/types/suggestion";

const statuses: SuggestionStatus[] = ["baru", "ditinjau", "selesai"];
const ITEMS_PER_PAGE = 10;

type FilterStatus = "aktif" | "semua" | SuggestionStatus;

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("aktif");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

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

      if (status === "selesai" && filterStatus === "aktif") {
        setMessage("Saran sudah ditandai selesai dan dipindahkan ke arsip.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal mengubah status."
      );
    } finally {
      setProcessingId(null);
    }
  }

  function resetPage() {
    setPage(1);
  }

  const summary = useMemo(() => {
    const baru = suggestions.filter((item) => item.status === "baru").length;
    const ditinjau = suggestions.filter(
      (item) => item.status === "ditinjau"
    ).length;
    const selesai = suggestions.filter(
      (item) => item.status === "selesai"
    ).length;

    return {
      baru,
      ditinjau,
      selesai,
      aktif: baru + ditinjau,
      total: suggestions.length,
    };
  }, [suggestions]);

  const filteredSuggestions = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return suggestions.filter((item) => {
      const matchStatus =
        filterStatus === "aktif"
          ? item.status === "baru" || item.status === "ditinjau"
          : filterStatus === "semua"
          ? true
          : item.status === filterStatus;

      const searchableText = [
        item.suggestion_type,
        item.status,
        item.equipment_model,
        item.service_type,
        item.part_no,
        item.current_description,
        item.suggestion_text,
        item.sender_name,
        item.sender_contact,
        item.admin_note,
      ]
        .join(" ")
        .toLowerCase();

      const matchSearch = !keyword || searchableText.includes(keyword);

      return matchStatus && matchSearch;
    });
  }, [suggestions, filterStatus, query]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSuggestions.length / ITEMS_PER_PAGE)
  );

  const paginatedSuggestions = filteredSuggestions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  function handleFilterChange(value: FilterStatus) {
    setFilterStatus(value);
    resetPage();
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    resetPage();
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <PageHeader
        title="Saran User"
        subtitle="Kelola saran perbaikan dan tambahan data dari user."
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

          <div className="grid grid-cols-2 gap-3">
            <SummaryCard label="Aktif" value={summary.aktif} />
            <SummaryCard label="Total" value={summary.total} />
            <SummaryCard label="Baru" value={summary.baru} />
            <SummaryCard label="Ditinjau" value={summary.ditinjau} />
            <SummaryCard label="Selesai" value={summary.selesai} />
          </div>

          <div className="rounded-2xl border border-[#D6DCE5] bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-[#0B1E3A]">
              Filter dan Pencarian
            </p>

            <p className="mt-1 text-xs text-[#64748B]">
              Default menampilkan saran aktif saja, yaitu status baru dan
              ditinjau. Saran selesai tetap tersimpan sebagai arsip.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <FilterButton
                label="Aktif"
                active={filterStatus === "aktif"}
                onClick={() => handleFilterChange("aktif")}
              />
              <FilterButton
                label="Semua"
                active={filterStatus === "semua"}
                onClick={() => handleFilterChange("semua")}
              />
              <FilterButton
                label="Baru"
                active={filterStatus === "baru"}
                onClick={() => handleFilterChange("baru")}
              />
              <FilterButton
                label="Ditinjau"
                active={filterStatus === "ditinjau"}
                onClick={() => handleFilterChange("ditinjau")}
              />
              <FilterButton
                label="Selesai"
                active={filterStatus === "selesai"}
                onClick={() => handleFilterChange("selesai")}
              />
            </div>

            <input
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Cari model, service, part no, isi saran, atau pengirim..."
              className="mt-4 w-full rounded-xl border border-[#D6DCE5] bg-[#F8FAFC] px-3 py-3 text-sm text-[#0B1E3A] outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1E3A]"
            />

            <p className="mt-3 text-xs text-[#64748B]">
              Menampilkan {paginatedSuggestions.length} dari{" "}
              {filteredSuggestions.length} saran.
            </p>
          </div>

          <div className="space-y-3">
            {paginatedSuggestions.map((item) => (
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
                  <InfoRow label="Status" value={item.status} />
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

            {!paginatedSuggestions.length ? (
              <p className="rounded-xl border border-[#D6DCE5] bg-white p-4 text-sm text-[#64748B]">
                Belum ada saran untuk filter ini.
              </p>
            ) : null}
          </div>

          {filteredSuggestions.length > ITEMS_PER_PAGE ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#D6DCE5] bg-white p-3 shadow-sm">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="rounded-xl border border-[#D6DCE5] px-3 py-2 text-sm font-bold text-[#0B1E3A] disabled:opacity-40"
              >
                Sebelumnya
              </button>

              <p className="text-sm font-semibold text-[#0B1E3A]">
                Halaman {page} / {totalPages}
              </p>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                className="rounded-xl border border-[#D6DCE5] px-3 py-2 text-sm font-bold text-[#0B1E3A] disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          ) : null}
        </AdminGuard>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#D6DCE5] bg-white p-4 text-center shadow-sm">
      <p className="text-2xl font-extrabold text-[#0B1E3A]">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase text-[#64748B]">
        {label}
      </p>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-sm font-bold ${
        active
          ? "bg-[#0B1E3A] text-white"
          : "border border-[#D6DCE5] bg-white text-[#0B1E3A]"
      }`}
      style={active ? { color: "white" } : undefined}
    >
      {label}
    </button>
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