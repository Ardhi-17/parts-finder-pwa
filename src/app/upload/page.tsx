"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import AdminGuard from "@/components/AdminGuard";
import { parsePartsExcel } from "@/lib/excelParser";
import { saveLocalParts } from "@/lib/indexedDb";
import { publishPartsToSupabase } from "@/lib/partsApi";
import { Part } from "@/types/part";
import {
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
  XCircle,
} from "lucide-react";

export default function UploadPage() {
  const [valid, setValid] = useState<Part[]>([]);
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [processStep, setProcessStep] = useState("");

  const isBusy = isReading || isPublishing;

  function waitForUI() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 150);
      });
    });
  }

  async function handleFile(file?: File) {
    if (!file) return;

    try {
      setIsReading(true);
      setProcessStep("Menyiapkan file...");
      setMessage("File sedang diproses. Mohon tunggu...");
      setValid([]);
      setErrors([]);
      setFileName(file.name);

      await waitForUI();

      setProcessStep("Membaca dan memvalidasi isi Excel...");
      await waitForUI();

      const result = await parsePartsExcel(file);

      setValid(result.valid);
      setErrors(result.errors);

      if (result.valid.length > 0) {
        setMessage(
          `File berhasil dibaca. Valid: ${result.valid.length}, Error: ${result.errors.length}`
        );
      } else {
        setMessage(
          `File terbaca, tetapi tidak ada data valid. Error: ${result.errors.length}. Kemungkinan format sheet/kolom belum sesuai.`
        );
      }
    } catch (error: any) {
      console.error("UPLOAD PARSE ERROR:", error);
      setMessage(error.message || "Gagal membaca file Excel.");
      setValid([]);
      setErrors([]);
    } finally {
      setProcessStep("");
      setIsReading(false);
    }
  }

  async function publish() {
    if (!valid.length) {
      setMessage("Tidak ada data valid untuk dipublish.");
      return;
    }

    try {
      setIsPublishing(true);
      setProcessStep("Mengirim data ke database pusat...");
      setMessage("Data sedang dipublish ke database pusat. Mohon tunggu...");

      await waitForUI();

      await publishPartsToSupabase(valid);

      setProcessStep("Menyimpan data offline di perangkat...");
      await waitForUI();

      await saveLocalParts(valid);

      setMessage(
        `Data berhasil dipublish ke database pusat dan disimpan offline: ${valid.length} item.`
      );
    } catch (error: any) {
      console.error("UPLOAD PUBLISH ERROR:", error);
      setMessage(error.message || "Gagal publish data ke database pusat.");
    } finally {
      setProcessStep("");
      setIsPublishing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <PageHeader
        title="Upload Excel"
        subtitle="Upload file sesuai dengan template."
      />

      {isBusy ? (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF8D6]">
              <Loader2 className="animate-spin text-[#0B1E3A]" size={28} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-[#0B1E3A]">
              Sedang Diproses
            </h2>

            <p className="mt-2 text-sm text-[#334155]">
              {processStep || "Mohon tunggu sebentar..."}
            </p>

            <p className="mt-3 text-xs text-[#64748B]">
              Jangan tutup halaman ini sampai proses selesai.
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-4 p-4">
        <AdminGuard title="Upload Excel dan publish">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#D6DCE5] bg-white px-3 py-2 text-sm font-semibold text-[#0B1E3A] shadow-sm transition hover:border-[#0B1E3A]"
        >
          Kembali ke Menu Utama
        </Link>

        <a
          className="block rounded-2xl border border-[#D6DCE5] bg-white px-4 py-4 text-center text-sm font-bold text-[#0B1E3A] shadow-sm"
          href="/template/MasterPartServiceTemplate.xlsx"
          download
        >
          Download Template
        </a>

        <label className="block rounded-2xl border border-[#E5C34A] bg-[#FFFDF4] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#F7C600] p-3">
              <FileSpreadsheet size={22} className="text-[#0B1E3A]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#0B1E3A]">
                Pilih File Excel
              </p>
              <p className="mt-1 truncate text-xs text-[#64748B]">
                {fileName || "Belum ada file dipilih"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#D6DCE5] bg-white p-2">
            <span className="inline-flex shrink-0 items-center rounded-lg bg-[#0B1E3A] px-4 py-2 text-sm font-semibold text-white">
              Pilih File
            </span>

            <span
              className={`truncate text-sm ${
                fileName ? "text-[#334155]" : "text-[#94A3B8]"
              }`}
            >
              {fileName || "Belum ada file dipilih"}
            </span>
          </div>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            disabled={isBusy}
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="sr-only"
          />

          <p className="mt-2 text-xs text-[#64748B]">
            Format yang didukung: .xlsx, .xls, .csv
          </p>
        </label>

        {message ? (
          <p className="rounded-2xl border border-[#EED98A] bg-[#FFF8D9] p-4 text-sm font-medium text-[#334155] shadow-sm">
            {message}
          </p>
        ) : null}

        {valid.length > 0 ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 text-green-700" size={20} />
              <div>
                <p className="text-sm font-bold text-green-800">
                  {valid.length} data valid.
                </p>
                <p className="mt-1 text-xs text-green-700">
                  Klik tombol publish untuk mengirim data ke database
                  online.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {errors.length ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 text-red-700" size={20} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-red-800">Data error</p>

                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                  {errors.slice(0, 15).map((error, index) => (
                    <li key={index}>
                      Baris {error.row}: {error.message}
                    </li>
                  ))}
                </ul>

                {errors.length > 15 ? (
                  <p className="mt-3 text-xs text-red-700">
                    Menampilkan 15 error pertama dari total {errors.length} error.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <button
          disabled={!valid.length || isPublishing || isReading}
          onClick={publish}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B1E3A] px-4 py-4 text-sm font-bold text-white disabled:bg-[#94A3B8] disabled:opacity-70"
          style={{ color: "white" }}
        >
          {isReading || isPublishing ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <UploadCloud size={18} />
          )}

          {isReading
            ? "Membaca File..."
            : isPublishing
            ? "Publishing..."
            : valid.length
            ? "Publish ke Database Pusat"
            : "Pilih File Valid "}
        </button>
        </AdminGuard>
      </div>
    </div>
  );
}