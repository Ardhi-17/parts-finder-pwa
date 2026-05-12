"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function AdminGuard({
  children,
  title = "Akses Admin",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <p className="rounded-2xl border border-[#D6DCE5] bg-white p-4 text-sm text-[#334155]">
        Memeriksa sesi login...
      </p>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-[#EED98A] bg-[#FFF8D9] p-4">
        <p className="text-sm font-semibold text-[#0B1E3A]">
          {title} hanya untuk admin/PIC yang sudah login.
        </p>
        <Link
          href="/admin/login"
          className="mt-3 inline-flex rounded-xl bg-[#0B1E3A] px-4 py-2 text-sm font-bold text-white"
          style={{ color: "white" }}
        >
          Login Admin
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
