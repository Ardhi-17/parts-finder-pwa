"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import Breadcrumb from "@/components/Breadcrumb";
import { getLocalParts, saveLocalParts } from "@/lib/indexedDb";
import { fetchRemoteParts } from "@/lib/partsApi";
import { Part } from "@/types/part";
import { detectBrandFromModel } from "@/constants/brands";
import { sortServiceTypes } from "@/lib/serviceSort";

export default function ModelServicePage() {
  const params = useParams();

  const brandKey = decodeURIComponent(String(params.brand || ""));
  const model = decodeURIComponent(String(params.model || ""));

  const [parts, setParts] = useState<Part[]>([]);
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

  const modelParts = useMemo(() => {
    return parts.filter(
      (part) =>
        getPartBrand(part) === brandKey && part.equipment_model === model
    );
  }, [parts, brandKey, model]);

  const services = useMemo(() => {
    const grouped = new Map<string, number>();

    modelParts.forEach((part) => {
      grouped.set(part.service_type, (grouped.get(part.service_type) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => sortServiceTypes(a.service, b.service));
  }, [modelParts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={model}
        subtitle="Pilih jenis service untuk melihat daftar part."
      />

      <div className="space-y-4 p-4">
        <Breadcrumb
          items={[
            { label: "Brand", href: "/search" },
            { label: brandKey, href: `/brand/${encodeURIComponent(brandKey)}` },
            { label: model },
          ]}
        />

        <Link
          href={`/brand/${encodeURIComponent(brandKey)}`}
          className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-bold text-gray-900 shadow-sm"
        >
          Kembali ke Model
        </Link>

        <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Brand</p>
          <p className="text-lg font-bold text-gray-900">{brandKey}</p>

          <div className="mt-3">
            <p className="text-sm text-gray-500">Model Unit</p>
            <p className="text-lg font-bold text-gray-900">{model}</p>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            {modelParts.length} total part tersedia
          </p>
        </div>

        {message ? (
          <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">
            {message}
          </p>
        ) : null}

        <div>
          <p className="text-sm font-bold text-gray-900">
            {services.length} jenis service
          </p>

          <div className="mt-3 space-y-3">
            {services.map((item) => (
              <Link
                key={item.service}
                href={`/brand/${encodeURIComponent(
                  brandKey
                )}/model/${encodeURIComponent(model)}/service/${encodeURIComponent(
                  item.service
                )}`}
                className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <p className="text-base font-bold text-gray-900">
                  {item.service}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {item.count} part tersedia
                </p>
              </Link>
            ))}
          </div>
        </div>

        {services.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm">
            <p className="font-bold text-gray-900">Service belum tersedia</p>
            <p className="mt-2 text-sm text-gray-500">
              Belum ada data service untuk model ini.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}