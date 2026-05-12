"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAdmin, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace("/parts");
    }
  }, [loading, isAdmin, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      await signIn(email.trim(), password);
      router.replace("/parts");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login gagal.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <PageHeader
        title="Login Admin"
        subtitle="Masuk untuk mengelola data dan publish ke database pusat."
      />

      <div className="space-y-4 p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#D6DCE5] bg-white px-3 py-2 text-sm font-semibold text-[#0B1E3A] shadow-sm transition hover:border-[#0B1E3A]"
        >
          Kembali ke Menu Utama
        </Link>

        <form
          onSubmit={onSubmit}
          className="space-y-3 rounded-2xl border border-[#D6DCE5] bg-white p-4 shadow-sm"
        >
          <label className="block text-sm font-semibold text-[#0B1E3A]">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-[#D6DCE5] bg-[#F8FAFC] px-3 py-3 text-sm text-[#0B1E3A] outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1E3A]"
            />
          </label>

          <label className="block text-sm font-semibold text-[#0B1E3A]">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-[#D6DCE5] bg-[#F8FAFC] px-3 py-3 text-sm text-[#0B1E3A] outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1E3A]"
            />
          </label>

          {message ? (
            <p className="rounded-xl border border-[#EED98A] bg-[#FFF8D9] p-3 text-sm text-[#334155]">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#0B1E3A] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            style={{ color: "white" }}
          >
            {submitting ? "Memproses..." : "Masuk sebagai Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
