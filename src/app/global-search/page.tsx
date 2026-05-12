"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getLocalParts, saveLocalParts } from "@/lib/indexedDb";
import { fetchRemoteParts } from "@/lib/partsApi";
import { Part } from "@/types/part";
import { detectBrandFromModel } from "@/constants/brands";
import { sortServiceTypes } from "@/lib/serviceSort";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";

type GroupedResult = {
  brand: string;
  model: string;
  service: string;
  count: number;
};

export default function GlobalSearchPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadParts();
  }, []);

  function getPartBrand(part: Part) {
    return part.brand || detectBrandFromModel(part.equipment_model);
  }

  async function loadParts() {
    try {
      const localParts = await getLocalParts();

      if (localParts.length) {
        setParts(localParts);
      }

      const remoteParts = await fetchRemoteParts();

      if (remoteParts.length) {
        await saveLocalParts(remoteParts);
        setParts(remoteParts);
      }
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Gagal mengambil data.");
    }
  }

  const groupedResults = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return [];

    const matchedParts = parts.filter((part) => {
      const brand = getPartBrand(part);

      const searchableText = [
        brand,
        part.equipment_model,
        part.service_type,
        part.part_no,
        part.description,
        part.qty,
        part.remark,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });

    const grouped = new Map<string, GroupedResult>();

    matchedParts.forEach((part) => {
      const brand = getPartBrand(part);
      const model = part.equipment_model;
      const service = part.service_type;

      const key = `${brand}__${model}__${service}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          brand,
          model,
          service,
          count: 0,
        });
      }

      const existing = grouped.get(key);

      if (existing) {
        existing.count += 1;
      }
    });

    return Array.from(grouped.values()).sort((a, b) => {
      const brandCompare = a.brand.localeCompare(b.brand);
      if (brandCompare !== 0) return brandCompare;

      const modelCompare = a.model.localeCompare(b.model);
      if (modelCompare !== 0) return modelCompare;

      return sortServiceTypes(a.service, b.service);
    });
  }, [parts, query]);

  const totalPartFound = useMemo(() => {
    return groupedResults.reduce((total, item) => total + item.count, 0);
  }, [groupedResults]);

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <PageHeader
        title="Cari Semua Part"
        subtitle="Cari model, service, part no, atau nama part."
      />

      <div className="space-y-4 p-4">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#D6DCE5] bg-white px-4 py-3 text-sm font-bold text-[#0B1E3A] shadow-sm"
        >
          <ArrowLeft size={16} />
          Kembali ke Pilih Brand
        </Link>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />

          <input
            className="w-full rounded-2xl border border-[#D6DCE5] bg-white py-3 pl-11 pr-4 text-sm text-[#0B1E3A] outline-none focus:ring-2 focus:ring-[#0B1E3A]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Contoh: PC200, PS 500, 6736, Engine Oil"
          />
        </div>

        {message ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {message}
          </p>
        ) : null}

        {!query ? (
          <div className="rounded-2xl border border-[#D6DCE5] bg-white p-5 text-center shadow-sm">
            <p className="font-bold text-[#0B1E3A]">Cari data part</p>
            <p className="mt-2 text-sm text-[#64748B]">
              Ketik model unit, part no, service, atau nama part. Hasil akan
              dikelompokkan berdasarkan model dan service agar lebih mudah
              dibaca.
            </p>
          </div>
        ) : null}

        {query ? (
          <div className="rounded-2xl border border-[#E5C34A] bg-[#FFFDF4] p-4 shadow-sm">
            <p className="text-sm font-bold text-[#0B1E3A]">
              {groupedResults.length} service ditemukan
            </p>

            <p className="mt-1 text-xs text-[#475569]">
              Total {totalPartFound} part item terkait kata kunci “{query}”.
            </p>
          </div>
        ) : null}

        <div className="space-y-3">
          {groupedResults.map((item) => (
            <Link
              key={`${item.brand}-${item.model}-${item.service}`}
              href={`/brand/${encodeURIComponent(
                item.brand
              )}/model/${encodeURIComponent(
                item.model
              )}/service/${encodeURIComponent(item.service)}`}
              className="block rounded-2xl border border-[#D6DCE5] bg-white p-4 shadow-sm transition hover:border-[#0B1E3A]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#FFF8D6] px-3 py-1 text-xs font-bold text-[#0B1E3A]">
                      {item.brand}
                    </span>

                    <span className="rounded-full bg-[#EAF0F7] px-3 py-1 text-xs font-bold text-[#1E3354]">
                      {item.model}
                    </span>
                  </div>

                  <h2 className="mt-3 text-base font-bold text-[#0B1E3A]">
                    {item.service}
                  </h2>

                  <p className="mt-1 text-sm text-[#64748B]">
                    {item.count} part tersedia
                  </p>
                </div>

                <div
                  className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#0B1E3A] px-3 py-2 text-xs font-bold text-white"
                  style={{ color: "white" }}
                >
                  Lihat
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {query && groupedResults.length === 0 ? (
          <div className="rounded-2xl border border-[#D6DCE5] bg-white p-5 text-center shadow-sm">
            <p className="font-bold text-[#0B1E3A]">Data tidak ditemukan</p>
            <p className="mt-2 text-sm text-[#64748B]">
              Coba gunakan kata kunci lain, misalnya model unit, part no, atau
              nama part.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}