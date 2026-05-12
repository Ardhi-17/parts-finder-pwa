"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getLocalParts, saveLocalParts } from "@/lib/indexedDb";
import { fetchRemoteParts } from "@/lib/partsApi";
import { Part } from "@/types/part";
import { BRANDS, detectBrandFromModel } from "@/constants/brands";
import { ArrowLeft, ArrowRight, RefreshCw, Search } from "lucide-react";

export default function SearchPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [message, setMessage] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("");

  useEffect(() => {
    autoLoadAndSync();
  }, []);

  function getPartBrand(part: Part) {
    return part.brand || detectBrandFromModel(part.equipment_model);
  }

  async function autoLoadAndSync() {
    try {
      setIsSyncing(true);
      setMessage("Memuat data...");

      const localParts = await getLocalParts();

      if (localParts.length) {
        setParts(localParts);
        setMessage(`${localParts.length} data lokal tersedia.`);
      }

      const remoteParts = await fetchRemoteParts();

      if (remoteParts.length) {
        await saveLocalParts(remoteParts);
        setParts(remoteParts);

        const now = new Date().toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        });

        setLastSync(now);
        setMessage(`Data otomatis diperbarui. ${remoteParts.length} data tersedia.`);
      } else if (!localParts.length) {
        setMessage("Belum ada data di database pusat.");
      }
    } catch (error: any) {
      console.error(error);

      const localParts = await getLocalParts();
      setParts(localParts);

      if (localParts.length) {
        setMessage(`Gagal update dari pusat. Menggunakan ${localParts.length} data offline.`);
      } else {
        setMessage(error.message || "Gagal mengambil data.");
      }
    } finally {
      setIsSyncing(false);
    }
  }

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    BRANDS.forEach((brand) => {
      counts[brand.key] = 0;
    });

    parts.forEach((part) => {
      const brand = getPartBrand(part);
      counts[brand] = (counts[brand] || 0) + 1;
    });

    return counts;
  }, [parts]);

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <PageHeader
        title="Parts Finder"
        subtitle="Pilih brand, model, service, atau gunakan pencarian bebas."
      />

      <div className="space-y-4 p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#D6DCE5] bg-white px-3 py-2 text-sm font-semibold text-[#0B1E3A] shadow-sm transition hover:border-[#0B1E3A]"
        >
          <ArrowLeft size={16} />
          Kembali ke Menu Utama
        </Link>

        <div className="overflow-hidden rounded-2xl border border-[#E5C34A] bg-[#FFFDF4] shadow-sm">
          <div className="h-1.5 bg-[#F7C600]" />
          <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center rounded-full bg-[#F7C600] px-2.5 py-0.5 text-[11px] font-bold text-[#0B1E3A]">
                Database Part
              </p>
              <p className="mt-1 text-xs text-[#475569]">
                {parts.length} data tersedia di perangkat
              </p>

              {lastSync ? (
                <p className="mt-1 text-xs text-[#475569]">
                  Terakhir update: {lastSync}
                </p>
              ) : null}
            </div>

            <button
              onClick={autoLoadAndSync}
              disabled={isSyncing}
              className="flex items-center gap-2 rounded-xl border border-[#0B1E3A] bg-[#0B1E3A] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#132a4d] disabled:opacity-50"
              style={{ color: "#ffffff" }}
            >
              <RefreshCw
                size={14}
                className={isSyncing ? "animate-spin" : ""}
              />
              {isSyncing ? "Update..." : "Refresh"}
            </button>
          </div>

          {message ? (
            <p className="mt-3 rounded-xl border border-[#EED98A] bg-[#FFF8D9] p-3 text-xs text-[#334155]">
              {message}
            </p>
          ) : null}
          </div>
        </div>

        <Link
          href="/global-search"
          className="flex items-center justify-center gap-2 rounded-2xl border border-[#0B1E3A] bg-[#0B1E3A] px-4 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#132a4d]"
          style={{ color: "#ffffff" }}
        >
          <Search size={18} />
          Cari Semua Part
          <ArrowRight size={16} />
        </Link>

        <section className="rounded-2xl border border-[#D6DCE5] bg-white p-4 shadow-sm">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-[#0B1E3A]">
            <span className="h-2 w-2 rounded-full bg-[#F7C600]" />
            Pilih Brand
          </h2>
          <p className="mt-1 text-sm text-[#475569]">
            Pilih brand untuk melihat model unit dan service.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {BRANDS.map((brand) => {
              const count = brandCounts[brand.key] || 0;
              const hasData = count > 0;

              return (
                <Link
                  key={brand.key}
                  href={`/brand/${encodeURIComponent(brand.key)}`}
                  className={`group overflow-hidden rounded-2xl border bg-white transition ${
                    !hasData ? "opacity-60" : ""
                  } ${hasData ? "border-[#D6DCE5] hover:-translate-y-0.5 hover:border-[#0B1E3A]" : "border-[#D6DCE5]"} ${
                    hasData ? "hover:shadow-sm" : ""
                  }`}
                >
                  <div className="relative h-28 w-full overflow-hidden bg-[#FFFDF2]">
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0B1E3A]/35 to-transparent" />
                    <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-[#F7C600]" />
                  </div>

                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-[#0B1E3A]">
                        {brand.name}
                      </p>
                      <span className="rounded-full bg-[#FFF8D6] px-2 py-0.5 text-[11px] font-bold text-[#0B1E3A]">
                        {count}
                      </span>
                    </div>

                    {!hasData ? (
                      <p className="mt-1 text-[11px] text-[#94A3B8]">
                        Belum ada data
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-[#64748B]">data part tersedia</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}