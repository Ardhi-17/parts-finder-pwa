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
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

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
    <div className="min-h-screen bg-[#F4F6F8] pb-6">
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
            <h1 className="mt-3 text-3xl font-extrabold text-white">Parts Finder</h1>
            <div className="mt-2 h-1.5 w-24 rounded-full bg-[#F7C600]" />
          </div>

        </header>

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
                  <ArrowRight size={16} className="text-[#64748B] transition group-hover:translate-x-0.5" />
                </div>

                <p className="mt-3 font-bold text-[#0B1E3A]">{menu.title}</p>
                <p className="mt-1 text-xs text-[#475569]">{menu.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}