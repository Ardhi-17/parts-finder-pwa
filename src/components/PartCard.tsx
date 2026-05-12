"use client";

import { Part } from "@/types/part";
import { togglePinned, isPinned } from "@/lib/pinnedParts";
import { Copy, Info, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PartCard({ part }: { part: Part }) {
  const [pinned, setPinned] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    isPinned(part.id).then(setPinned);
  }, [part.id]);

  async function handleCopyPartNo() {
    const text = String(part.part_no || "");

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const success = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!success) {
          throw new Error("Copy gagal");
        }
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error(error);
      window.prompt("Copy manual Part No ini:", text);
    }
  }

  async function handleTogglePinned() {
    const now = await togglePinned(part);
    setPinned(now);
  }

  return (
    <>
      <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                {part.equipment_model}
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                {part.service_type}
              </span>
            </div>

            <h2 className="mt-3 text-base font-bold leading-snug text-gray-900">
              {part.description}
            </h2>

            <div className="mt-3 space-y-1 text-sm text-gray-700">
              <p>
                Part No:{" "}
                <span className="font-semibold text-gray-900">
                  {part.part_no}
                </span>
              </p>

              <p>
                Qty:{" "}
                <span className="font-semibold text-gray-900">
                  {part.qty}
                </span>
              </p>

              {part.remark ? (
                <p className="text-gray-500">Remark: {part.remark}</p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            aria-label="Pin part"
            onClick={handleTogglePinned}
            className={`shrink-0 rounded-full border p-2 ${
              pinned
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700"
            }`}
          >
            <Star size={18} fill={pinned ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyPartNo}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold text-gray-800"
          >
            <Copy size={16} />
            {copied ? "Tersalin" : "Copy Part No"}
          </button>

          <button
            type="button"
            onClick={() => setShowDetail(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-3 text-sm font-semibold text-white"
          >
            <Info size={16} />
            Detail
          </button>
        </div>
      </article>

      {showDetail ? (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            padding: 16,
          }}
        >
          <div
            className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            style={{
              width: "100%",
              maxWidth: 448,
              maxHeight: "88vh",
              background: "white",
              borderRadius: 24,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
            }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-gray-200 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Detail Part
                </p>

                <h3 className="mt-1 break-words text-lg font-bold leading-snug text-gray-900">
                  {part.description}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowDetail(false)}
                className="shrink-0 rounded-full border border-gray-200 bg-white p-2"
                aria-label="Tutup detail"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <DetailRow label="Equipment Model" value={part.equipment_model} />
              <DetailRow label="Service Type" value={part.service_type} />
              <DetailRow label="Part No" value={part.part_no} />
              <DetailRow label="Description" value={part.description} />
              <DetailRow label="Qty" value={String(part.qty)} />
              <DetailRow label="Remark" value={part.remark || "-"} />
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-gray-200 p-4">
              <button
                type="button"
                onClick={handleCopyPartNo}
                className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold text-gray-800"
              >
                {copied ? "Tersalin" : "Copy Part No"}
              </button>

              <Link
                href={`/suggest?equipment_model=${encodeURIComponent(
                  part.equipment_model
                )}&service_type=${encodeURIComponent(
                  part.service_type
                )}&part_no=${encodeURIComponent(
                  part.part_no
                )}&description=${encodeURIComponent(part.description)}`}
                className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-center text-sm font-semibold text-gray-800"
              >
                Kirim Saran
              </Link>

              <button
                type="button"
                onClick={() => setShowDetail(false)}
                className="col-span-2 rounded-xl bg-gray-900 px-3 py-3 text-sm font-semibold text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold leading-relaxed text-gray-900">
        {value}
      </p>
    </div>
  );
}