"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import AdminGuard from "@/components/AdminGuard";
import { fetchAllReviews, updateUserReview } from "@/lib/reviewsApi";
import { UserReview } from "@/types/review";
import { Eye, EyeOff, Star } from "lucide-react";

type FilterMode = "semua" | "tampil" | "tersembunyi";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("semua");
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    try {
      setMessage("");
      const data = await fetchAllReviews();
      setReviews(data);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal mengambil ulasan."
      );
    }
  }

  async function toggleVisibility(review: UserReview) {
    try {
      setProcessingId(review.id);

      const updated = await updateUserReview(review.id, {
        is_visible: !review.is_visible,
      });

      setReviews((prev) =>
        prev.map((item) => (item.id === review.id ? updated : item))
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal mengubah ulasan."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function updateAdminNote(review: UserReview, adminNote: string) {
    try {
      setProcessingId(review.id);

      const updated = await updateUserReview(review.id, {
        admin_note: adminNote,
      });

      setReviews((prev) =>
        prev.map((item) => (item.id === review.id ? updated : item))
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan catatan admin."
      );
    } finally {
      setProcessingId(null);
    }
  }

  const summary = useMemo(() => {
    return {
      total: reviews.length,
      tampil: reviews.filter((item) => item.is_visible).length,
      tersembunyi: reviews.filter((item) => !item.is_visible).length,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return reviews.filter((item) => {
      const matchMode =
        filterMode === "semua"
          ? true
          : filterMode === "tampil"
          ? item.is_visible
          : !item.is_visible;

      const text = [
        item.sender_name,
        item.sender_role,
        item.rating,
        item.review_text,
        item.admin_note,
      ]
        .join(" ")
        .toLowerCase();

      const matchSearch = !keyword || text.includes(keyword);

      return matchMode && matchSearch;
    });
  }, [reviews, filterMode, query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Kelola Ulasan"
        subtitle="Tampilkan atau sembunyikan ulasan pengguna di halaman utama."
      />

      <div className="space-y-4 p-4">
        <Link
          href="/parts"
          className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-bold text-gray-900 shadow-sm"
        >
          Kembali ke Data Part
        </Link>

        <AdminGuard title="Kelola ulasan pengguna">
          {message ? (
            <p className="rounded-xl bg-yellow-50 p-3 text-sm text-gray-700">
              {message}
            </p>
          ) : null}

          <div className="grid grid-cols-3 gap-3">
            <SummaryCard label="Total" value={summary.total} />
            <SummaryCard label="Tampil" value={summary.tampil} />
            <SummaryCard label="Tersembunyi" value={summary.tersembunyi} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-bold text-gray-900">
              Filter Ulasan
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <FilterButton
                label="Semua"
                active={filterMode === "semua"}
                onClick={() => setFilterMode("semua")}
              />
              <FilterButton
                label="Tampil"
                active={filterMode === "tampil"}
                onClick={() => setFilterMode("tampil")}
              />
              <FilterButton
                label="Hidden"
                active={filterMode === "tersembunyi"}
                onClick={() => setFilterMode("tersembunyi")}
              />
            </div>

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama, role, isi ulasan, atau catatan admin..."
              className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div className="space-y-3">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating || 5 }).map(
                        (_, index) => (
                          <Star
                            key={index}
                            size={14}
                            className="fill-current text-yellow-500"
                          />
                        )
                      )}
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleString("id-ID")
                        : "-"}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={processingId === review.id}
                    onClick={() => toggleVisibility(review)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
                      review.is_visible
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {review.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    {review.is_visible ? "Tampil" : "Hidden"}
                  </button>
                </div>

                <div className="mt-3 rounded-xl bg-gray-50 p-3">
                  <p className="text-xs font-bold uppercase text-gray-500">
                    Isi Ulasan
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm font-semibold text-gray-900">
                    {review.review_text}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                  <InfoRow
                    label="Nama"
                    value={review.sender_name || "Tanpa nama"}
                  />
                  <InfoRow
                    label="Role"
                    value={review.sender_role || "-"}
                  />
                </div>

                <label className="mt-3 block text-sm font-semibold text-gray-900">
                  Catatan Admin
                  <textarea
                    defaultValue={review.admin_note || ""}
                    rows={2}
                    onBlur={(event) =>
                      updateAdminNote(review, event.target.value)
                    }
                    placeholder="Catatan internal admin, opsional"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-gray-900"
                  />
                </label>

                {processingId === review.id ? (
                  <p className="mt-3 rounded-xl bg-yellow-50 p-3 text-xs text-gray-700">
                    Memproses perubahan...
                  </p>
                ) : null}
              </div>
            ))}

            {!filteredReviews.length ? (
              <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
                Belum ada ulasan untuk filter ini.
              </p>
            ) : null}
          </div>
        </AdminGuard>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm">
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase text-gray-500">
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
          ? "bg-gray-900 text-white"
          : "border border-gray-200 bg-white text-gray-900"
      }`}
      style={active ? { color: "white" } : undefined}
    >
      {label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3">
      <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}