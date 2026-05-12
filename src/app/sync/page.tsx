"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { fetchRemoteParts } from "@/lib/partsApi";
import { saveLocalParts } from "@/lib/indexedDb";
import { CheckCircle2, Database, RefreshCw, Wifi } from "lucide-react";

export default function SyncPage() {
  const [message, setMessage] = useState("Status sinkronisasi data: perangkat belum menerima pembaruan.");
  const [isSyncing, setIsSyncing] = useState(false);
  const [totalData, setTotalData] = useState<number | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  async function sync() {
    try {
      setIsSyncing(true);
      setMessage("Sedang memproses sinkronisasi data terbaru...");

      const parts = await fetchRemoteParts();

      if (!parts.length) {
        setMessage("Data pada database tidak ditemukan.");
        setTotalData(0);
        return;
      }

      await saveLocalParts(parts);

      const now = new Date().toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      setTotalData(parts.length);
      setLastSync(now);
      setMessage(`Sinkronisasi berhasil. Sebanyak ${parts.length} data telah tersimpan.`);
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Sinkronisasi gagal.");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <PageHeader
        title="Update Data Offline"
        subtitle="Lakukan sinkronisasi secara berkala untuk memastikan perangkat Anda selalu mendapatkan data terbaru."
      />

      <div className="space-y-4 p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#D6DCE5] bg-white px-3 py-2 text-sm font-semibold text-[#0B1E3A] shadow-sm transition hover:border-[#0B1E3A]"
        >
          Kembali ke Menu Utama
        </Link>

        <div className="overflow-hidden rounded-2xl border border-[#D6DCE5] bg-[#0B1E3A] p-5 text-white shadow-sm">
          <div className="mb-4 h-1.5 w-24 rounded-full bg-[#F7C600]" />
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Database size={24} />
            </div>
            <div>
              <p className="text-sm text-[#D4DEE9]">Status Data Lokal</p>
              <h2 className="text-xl font-bold">
                {totalData === null ? "Status data lokal tidak tersedia" : `${totalData} data`}
              </h2>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-[#D4DEE9]">Waktu Sinkronisasi</p>
              <p className="mt-1 text-sm font-semibold">
                {lastSync || "Update data offline belum pernah dilakukan"}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-xs text-[#D4DEE9]">Metode</p>
              <p className="mt-1 text-sm font-semibold">
                Data tersimpan pada perangkat dan dapat diakses secara offline.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5C34A] bg-[#FFFDF4] p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[#F7C600] p-3 text-[#0B1E3A]">
              <Wifi size={20} />
            </div>
            <div>
              <p className="font-semibold text-[#0B1E3A]">
                Pastikan perangkat Anda terhubung dengan internet
              </p>
              <p className="mt-1 text-sm text-[#475569]">
                Tekan tombol Update Data Offline untuk memperbarui data pada perangkat Anda.
              </p>
            </div>
          </div>
        </div>

        <p className="rounded-2xl border border-[#D6DCE5] bg-white p-4 text-sm text-[#334155] shadow-sm">
          {message}
        </p>

        <button
          onClick={sync}
          disabled={isSyncing}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B1E3A] px-4 py-4 font-semibold text-white disabled:opacity-50"
          style={{ color: "#ffffff" }}
        >
          {isSyncing ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Update data sedang berlangsung...
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              Update Data Offline
            </>
          )}
        </button>
      </div>
    </div>
  );
}