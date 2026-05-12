"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Breadcrumb from "@/components/Breadcrumb";
import PartCard from "@/components/PartCard";
import { getLocalParts, saveLocalParts } from "@/lib/indexedDb";
import { fetchRemoteParts } from "@/lib/partsApi";
import { searchParts } from "@/lib/searchParts";
import { Part } from "@/types/part";
import { detectBrandFromModel } from "@/constants/brands";
import { Search } from "lucide-react";

export default function ServicePartsPage() {
  const params = useParams();

  const brandKey = decodeURIComponent(String(params.brand || ""));
  const model = decodeURIComponent(String(params.model || ""));
  const service = decodeURIComponent(String(params.service || ""));

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

  const serviceParts = useMemo(() => {
    return parts.filter(
      (part) =>
        getPartBrand(part) === brandKey &&
        part.equipment_model === model &&
        part.service_type === service
    );
  }, [parts, brandKey, model, service]);

  const results = useMemo(() => {
    return searchParts(serviceParts, query);
  }, [serviceParts, query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={service} subtitle={`${brandKey} • ${model}`} />

      <div className="space-y-4 p-4">
        <Breadcrumb
          items={[
            { label: "Brand", href: "/search" },
            { label: brandKey, href: `/brand/${encodeURIComponent(brandKey)}` },
            {
              label: model,
              href: `/brand/${encodeURIComponent(brandKey)}/model/${encodeURIComponent(
                model
              )}`,
            },
            { label: service },
          ]}
        />

        <Link
          href={`/brand/${encodeURIComponent(brandKey)}/model/${encodeURIComponent(
            model
          )}`}
          className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-bold text-gray-900 shadow-sm"
        >
          Kembali ke Service
        </Link>

        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Service</p>
          <p className="text-lg font-bold text-gray-900">{service}</p>

          <p className="mt-3 text-sm text-gray-500">
            {serviceParts.length} part tersedia
          </p>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari part no atau description..."
          />
        </div>

        {message ? (
          <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">
            {message}
          </p>
        ) : null}

        <p className="text-sm font-bold text-gray-900">
          {results.length} part ditemukan
        </p>

        <div className="space-y-3">
          {results.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      </div>
    </div>
  );
}