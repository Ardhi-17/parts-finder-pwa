"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search,
  PlusCircle,
  Star,
  RefreshCw,
  ArrowRight,
  MessageSquare,
  UploadCloud,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import UserReviewsSection from "@/components/UserReviewsSection";

export default function HomePage() {
  const { isAdmin } = useAuth();

  const menus = isAdmin
    ? [
        {
          href: "/search",
          title: "Cari Part",
          description: "Cari nama, kode, atau keyword.",
          icon: Search,
        },
        {
          href: "/parts",
          title: "Kelola Data",
          description: "Tambah, edit, nonaktifkan, hapus.",
          icon: PlusCircle,
        },
        {
          href: "/upload",
          title: "Upload Excel",
          description: "Import massal dan publish data.",
          icon: UploadCloud,
        },
        {
          href: "/admin/suggestions",
          title: "Saran User",
          description: "Cek saran perbaikan data.",
          icon: MessageSquare,
        },
        {
          href: "/admin/reviews",
          title: "Kelola Ulasan",
          description: "Tampilkan atau sembunyikan ulasan.",
          icon: MessageCircle,
        },
        {
          href: "/sync",
          title: "Refresh Data",
          description: "Update data offline di perangkat.",
          icon: RefreshCw,
        },
      ]
    : [
        {
          href: "/search",
          title: "Cari Part",
          description: "Cari nama, kode, atau keyword.",
          icon: Search,
        },
        {
          href: "/pinned",
          title: "Favorit",
          description: "Akses data part yang ditandai.",
          icon: Star,
        },
        {
          href: "/suggest",
          title: "Kirim Saran",
          description: "Saran perbaikan/tambahan data.",
          icon: MessageSquare,
        },
        {
          href: "/sync",
          title: "Update Data Offline",
          description: "Ambil data terbaru dari Supabase.",
          icon: RefreshCw,
        },
      ];

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-28">
      <section className="space-y-4 p-4">
        <header className="overflow-hidden rounded-2xl border border-[#0B1E3A] bg-[#0B1E3A] p-5 text-white shadow-sm">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-3xl border-2 border-[#E5C34A] bg-white p-3">
              <Image
                src="/logo.png"
                alt="Parts Finder Logo"
                width={92}
                height={92}
                className="h-[92px] w-[92px] object-contain"
                priority
              />
            </div>

            <h1 className="mt-3 text-3xl font-extrabold text-white">
              Parts Finder
            </h1>

            <div className="mt-2 h-1.5 w-24 rounded-full bg-[#F7C600]" />

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#C7D2E2]">
              Cari part service berdasarkan brand, model, service, atau kode
              part. Data bisa digunakan secara mobile dan offline.
            </p>
          </div>
        </header>

        <div className="rounded-2xl border border-[#D6DCE5] bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-[#0B1E3A]">
            {isAdmin ? "Menu Admin" : "Menu Utama"}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            {isAdmin
              ? "Kelola data, saran, ulasan, dan sinkronisasi aplikasi."
              : "Cari part, simpan favorit, kirim saran, dan update data offline."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className="group rounded-2xl border border-[#E5C34A] bg-[#FFFDF4] p-4 shadow-sm transition hover:border-[#D9A900]"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-[#0B1E3A] p-2 text-[#F7C600]">
                    <Icon size={18} />
                  </div>

                  <ArrowRight
                    size={16}
                    className="text-[#64748B] transition group-hover:translate-x-0.5"
                  />
                </div>

                <p className="mt-3 font-bold text-[#0B1E3A]">{menu.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#475569]">
                  {menu.description}
                </p>
              </Link>
            );
          })}
        </div>

        <UserReviewsSection />
      </section>
    </div>
  );
}