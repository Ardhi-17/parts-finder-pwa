"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createUserReview, fetchVisibleReviews } from "@/lib/reviewsApi";
import { UserReview } from "@/types/review";
import { MessageSquare, Send, Star } from "lucide-react";

export default function UserReviewsSection() {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [senderName, setSenderName] = useState("");
  const [senderRole, setSenderRole] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (reviews.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [reviews.length]);

  async function loadReviews() {
    try {
      const data = await fetchVisibleReviews();
      setReviews(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!reviewText.trim()) {
      setMessage("Ulasan wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);

      await createUserReview({
        sender_name: senderName,
        sender_role: senderRole,
        rating,
        review_text: reviewText,
      });

      setSenderName("");
      setSenderRole("");
      setRating(5);
      setReviewText("");

      setMessage(
        "Terima kasih. Ulasan berhasil dikirim dan akan tampil setelah dicek admin."
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal mengirim ulasan."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const activeReview = useMemo(() => {
    if (!reviews.length) return null;
    return reviews[activeIndex] || reviews[0];
  }, [reviews, activeIndex]);

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-gray-100 p-3">
            <MessageSquare size={24} className="text-gray-800" />
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-gray-900">
              Ulasan Pengguna
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Bagikan pengalaman menggunakan aplikasi Parts Finder. Ulasan yang
              sudah dicek admin akan tampil di halaman utama.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-gray-900 p-5 text-white shadow-sm">
        {activeReview ? (
          <div>
            <div className="flex items-center gap-1">
              {Array.from({ length: activeReview.rating || 5 }).map(
                (_, index) => (
                  <Star
                    key={index}
                    size={16}
                    className="fill-current text-yellow-300"
                  />
                )
              )}
            </div>

            <p className="mt-4 text-base font-semibold leading-relaxed">
              “{activeReview.review_text}”
            </p>

            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="text-sm font-bold">
                {activeReview.sender_name || "Pengguna Parts Finder"}
              </p>
              <p className="text-xs text-gray-300">
                {activeReview.sender_role || "User"}
              </p>
            </div>

            {reviews.length > 1 ? (
              <div className="mt-4 flex gap-1.5">
                {reviews.map((review, index) => (
                  <button
                    key={review.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === activeIndex
                        ? "w-6 bg-white"
                        : "w-2 bg-white/30"
                    }`}
                    aria-label={`Lihat ulasan ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div>
            <p className="text-base font-bold">Belum ada ulasan tampil.</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">
              Ulasan yang dikirim user akan masuk ke admin terlebih dahulu.
              Setelah disetujui, ulasan akan muncul di sini.
            </p>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div>
          <h3 className="text-base font-extrabold text-gray-900">
            Tulis Ulasan
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Ulasan ini untuk pengalaman penggunaan aplikasi, bukan untuk koreksi
            data part.
          </p>
        </div>

        <label className="block text-sm font-semibold text-gray-900">
          Nama Pengguna, opsional
          <input
            value={senderName}
            onChange={(event) => setSenderName(event.target.value)}
            placeholder="Contoh: Teknisi Site A"
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-gray-900"
          />
        </label>

        <label className="block text-sm font-semibold text-gray-900">
          Role / Bagian, opsional
          <input
            value={senderRole}
            onChange={(event) => setSenderRole(event.target.value)}
            placeholder="Contoh: Teknisi, PIC, Admin"
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-gray-900"
          />
        </label>

        <label className="block text-sm font-semibold text-gray-900">
          Rating
          <select
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-gray-900"
          >
            <option value={5}>5 - Sangat membantu</option>
            <option value={4}>4 - Membantu</option>
            <option value={3}>3 - Cukup</option>
            <option value={2}>2 - Kurang</option>
            <option value={1}>1 - Perlu banyak perbaikan</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-gray-900">
          Ulasan <span className="text-red-600">*</span>
          <textarea
            required
            rows={4}
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            placeholder="Contoh: Aplikasi ini membantu saya mencari part lebih cepat dari HP."
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-gray-900"
          />
        </label>

        {message ? (
          <p className="rounded-xl bg-yellow-50 p-3 text-sm text-gray-700">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          style={{ color: "white" }}
        >
          <Send size={16} />
          {submitting ? "Mengirim..." : "Kirim Ulasan"}
        </button>
      </form>
    </section>
  );
}