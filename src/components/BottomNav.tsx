"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  LogIn,
  LogOut,
  MessageSquare,
  RefreshCw,
  Search,
  Star,
  Upload,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function BottomNav() {
  const pathname = usePathname();
  const { isAdmin, signOut } = useAuth();
  const items = isAdmin
    ? [
        { href: "/search", label: "Cari", icon: Search },
        { href: "/pinned", label: "Pin", icon: Star },
        { href: "/parts", label: "Data", icon: Database },
        { href: "/upload", label: "Upload", icon: Upload },
        { href: "/sync", label: "Sync", icon: RefreshCw },
      ]
    : [
        { href: "/search", label: "Cari", icon: Search },
        { href: "/pinned", label: "Pin", icon: Star },
        { href: "/suggest", label: "Saran", icon: MessageSquare },
        { href: "/sync", label: "Sync", icon: RefreshCw },
        { href: "/admin/login", label: "Login", icon: LogIn },
      ];

  async function handleLogout() {
    await signOut();
  }

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-[#0F2A4A] bg-[#0B1E3A] shadow-sm">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/search" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-transform duration-150 active:scale-95"
            >
              <div
                className={[
                  "rounded-xl px-3 py-1.5 transition-all duration-200",
                  active
                    ? "bg-[#F7C600] text-[#0B1E3A]"
                    : "bg-transparent text-[#C7D2E2] group-active:bg-[#16335A]",
                ].join(" ")}
              >
                <Icon
                  size={18}
                  className={active ? "transition-transform duration-200" : "transition-transform duration-200 group-active:scale-90"}
                />
              </div>
              <span
                className={[
                  "transition-colors duration-200",
                  active ? "text-[#F7C600]" : "text-[#C7D2E2] group-active:text-white",
                ].join(" ")}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {isAdmin ? (
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 border-t border-[#16335A] py-2 text-xs font-semibold text-[#C7D2E2]"
        >
          <LogOut size={14} />
          Logout Admin
        </button>
      ) : null}
    </nav>
  );
}