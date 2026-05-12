"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { getLocalParts, saveLocalParts } from "@/lib/indexedDb";
import { fetchRemoteParts } from "@/lib/partsApi";
import { Part } from "@/types/part";
import { BRANDS, detectBrandFromModel } from "@/constants/brands";
import { Layers, Search, Wrench } from "lucide-react";

export default function BrandModelPage() {
  const params = useParams();
  const brandKey = decodeURIComponent(String(params.brand || ""));

  const [parts, setParts] = useState<Part[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const brandInfo = BRANDS.find((brand) => brand.key === brandKey);

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

  const brandParts = useMemo(() => {
    return parts.filter((part) => getPartBrand(part) === brandKey);
  }, [parts, brandKey]);

  const models = useMemo(() => {
    const grouped = new Map<string, number>();

    brandParts.forEach((part) => {
      grouped.set(
        part.equipment_model,
        (grouped.get(part.equipment_model) || 0) + 1
      );
    });

    return Array.from(grouped.entries())
      .map(([model, count]) => ({ model, count }))
      .filter((item) => item.model.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.model.localeCompare(b.model));
  }, [brandParts, query]);

  const serviceSummary = useMemo(() => {
    const grouped = new Map<string, number>();

    brandParts.forEach((part) => {
      grouped.set(part.service_type, (grouped.get(part.service_type) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count);
  }, [brandParts]);

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <PageHeader
        title={brandInfo?.name || brandKey}
        subtitle="Pilih model unit untuk melihat part service."
      />

      <div className="space-y-4 p-4">
        <Link
          href="/search"
          className="block rounded-2xl border border-[#D6DCE5] bg-white px-4 py-3 text-center text-sm font-bold text-[#0B1E3A] shadow-sm"
        >
          Kembali ke Brand
        </Link>

        {brandInfo ? (
          <div className="overflow-hidden rounded-2xl border border-[#D6DCE5] bg-white shadow-sm">
            <div className="h-44 w-full overflow-hidden bg-[#FFFDF4] p-3">
              <img
                src={brandInfo.image}
                alt={brandInfo.name}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="border-t border-[#E5C34A] p-4">
              <p className="text-lg font-bold text-[#0B1E3A]">
                {brandInfo.name}
              </p>
              <p className="mt-1 text-sm text-[#475569]">
                {brandParts.length} data part tersedia
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-[#E5C34A] bg-[#FFF8D6] p-3">
                  <p className="flex items-center gap-1 text-xs font-semibold text-[#0B1E3A]">
                    <Layers size={14} />
                    Model
                  </p>
                  <p className="mt-1 text-base font-extrabold text-[#0B1E3A]">
                    {models.length}
                  </p>
                </div>
                <div className="rounded-xl border border-[#D6DCE5] bg-[#F8FAFC] p-3">
                  <p className="flex items-center gap-1 text-xs font-semibold text-[#0B1E3A]">
                    <Wrench size={14} />
                    Jenis Service
                  </p>
                  <p className="mt-1 text-base font-extrabold text-[#0B1E3A]">
                    {serviceSummary.length}
                  </p>
                </div>
              </div>

              {serviceSummary.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {serviceSummary.slice(0, 6).map((item) => (
                    <span
                      key={item.service}
                      className="rounded-full border border-[#D6DCE5] bg-white px-3 py-1 text-xs font-semibold text-[#334155]"
                    >
                      {item.service} ({item.count})
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />

          <input
            className="w-full rounded-2xl border border-[#D6DCE5] bg-white py-3 pl-11 pr-4 text-sm text-[#0B1E3A] outline-none focus:ring-2 focus:ring-[#0B1E3A]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari model unit..."
          />
        </div>

        {message ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {message}
          </p>
        ) : null}

        <div>
          <p className="text-sm font-bold text-[#0B1E3A]">
            {models.length} model unit
          </p>

          <div className="mt-3 space-y-3">
            {models.map((item) => (
              <Link
                key={item.model}
                href={`/brand/${encodeURIComponent(
                  brandKey
                )}/model/${encodeURIComponent(item.model)}`}
                className="block rounded-2xl border border-[#D6DCE5] bg-white p-4 shadow-sm transition hover:border-[#0B1E3A]"
              >
                <p className="text-base font-bold text-[#0B1E3A]">
                  {item.model}
                </p>
                <p className="mt-1 text-sm text-[#64748B]">
                  {item.count} part tersedia
                </p>
              </Link>
            ))}
          </div>
        </div>

        {models.length === 0 ? (
          <div className="rounded-2xl border border-[#D6DCE5] bg-white p-5 text-center shadow-sm">
            <p className="font-bold text-[#0B1E3A]">Belum ada model</p>
            <p className="mt-2 text-sm text-[#64748B]">
              Data untuk brand ini belum tersedia.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}