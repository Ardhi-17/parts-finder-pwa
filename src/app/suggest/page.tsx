"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { createSuggestion } from "@/lib/suggestionsApi";
import { SuggestionType } from "@/types/suggestion";

type SuggestionForm = {
  equipment_model: string;
  service_type: string;
  part_no: string;
  current_description: string;
};

export default function SuggestPage() {
  const [suggestionType, setSuggestionType] =
    useState<SuggestionType>("perbaikan_data");

  const [form, setForm] = useState<SuggestionForm>({
    equipment_model: "",
    service_type: "",
    part_no: "",
    current_description: "",
  });

  const [suggestionText, setSuggestionText] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderContact, setSenderContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setForm({
      equipment_model: params.get("equipment_model") || "",
      service_type: params.get("service_type") || "",
      part_no: params.get("part_no") || "",
      current_description: params.get("description") || "",
    });
  }, []);

  function updateField(field: keyof SuggestionForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    if (!suggestionText.trim()) {
      setMessage("Saran wajib diisi.");
      setSubmitting(false);
      return;
    }

    try {
      await createSuggestion({
        suggestion_type: suggestionType,
        equipment_model: form.equipment_model.trim(),
        service_type: form.service_type.trim(),
        part_no: form.part_no.trim(),
        current_description: form.current_description.trim(),
        suggestion_text: suggestionText.trim(),
        sender_name: senderName.trim(),
        sender_contact: senderContact.trim(),
      });

      setSuggestionText("");
      setSenderName("");
      setSenderContact("");
      setMessage("Terima kasih. Saran berhasil dikirim.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gagal mengirim saran."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <PageHeader
        title="Kirim Saran Data"
        subtitle="Form ini bisa dipakai tanpa login untuk perbaikan atau tambahan data."
      />

      <div className="space-y-4 p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#D6DCE5] bg-white px-3 py-2 text-sm font-semibold text-[#0B1E3A] shadow-sm transition hover:border-[#0B1E3A]"
        >
          Kembali ke Menu Utama
        </Link>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-[#D6DCE5] bg-white p-4 shadow-sm"
        >
          <label className="block text-sm font-semibold text-[#0B1E3A]">
            Jenis Saran
            <select
              value={suggestionType}
              onChange={(event) =>
                setSuggestionType(event.target.value as SuggestionType)
              }
              className="mt-1 w-full rounded-xl border border-[#D6DCE5] bg-[#F8FAFC] px-3 py-3 text-sm text-[#0B1E3A] outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1E3A]"
            >
              <option value="perbaikan_data">Perbaikan Data</option>
              <option value="tambahan_data">Tambahan Data</option>
            </select>
          </label>

          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <p className="text-sm font-bold text-[#0B1E3A]">
              Data yang Disarankan
            </p>

            <p className="mt-1 text-xs text-[#64748B]">
              Jika dibuka dari detail part, data akan terisi otomatis. Field ini
              tetap bisa diedit atau diisi manual.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3">
              <EditableField
                label="Model"
                value={form.equipment_model}
                placeholder="Contoh: PC200-10MOCE"
                onChange={(value) => updateField("equipment_model", value)}
              />

              <EditableField
                label="Service"
                value={form.service_type}
                placeholder="Contoh: PS 500"
                onChange={(value) => updateField("service_type", value)}
              />

              <EditableField
                label="Part No"
                value={form.part_no}
                placeholder="Contoh: 6736-51-5142"
                onChange={(value) => updateField("part_no", value)}
              />

              <label className="block text-sm font-semibold text-[#0B1E3A]">
                Deskripsi Saat Ini
                <textarea
                  rows={3}
                  value={form.current_description}
                  onChange={(event) =>
                    updateField("current_description", event.target.value)
                  }
                  placeholder="Contoh: Engine Oil Filter"
                  className="mt-1 w-full rounded-xl border border-[#D6DCE5] bg-white px-3 py-3 text-sm text-[#0B1E3A] outline-none focus:ring-2 focus:ring-[#0B1E3A]"
                />
              </label>
            </div>
          </div>

          <label className="block text-sm font-semibold text-[#0B1E3A]">
            Saran <span className="text-red-600">*</span>
            <textarea
              required
              rows={4}
              value={suggestionText}
              onChange={(event) => setSuggestionText(event.target.value)}
              placeholder={
                suggestionType === "perbaikan_data"
                  ? "Tulis bagian yang perlu diperbaiki. Contoh: Qty seharusnya 2, bukan 1."
                  : "Tulis data baru yang perlu ditambahkan. Contoh: Tambahkan part untuk model baru."
              }
              className="mt-1 w-full rounded-xl border border-[#D6DCE5] bg-[#F8FAFC] px-3 py-3 text-sm text-[#0B1E3A] outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1E3A]"
            />
          </label>

          <div className="grid grid-cols-1 gap-3">
            <label className="block text-sm font-semibold text-[#0B1E3A]">
              Nama Pengirim (opsional)
              <input
                value={senderName}
                onChange={(event) => setSenderName(event.target.value)}
                placeholder="Nama teknisi / pengirim"
                className="mt-1 w-full rounded-xl border border-[#D6DCE5] bg-[#F8FAFC] px-3 py-3 text-sm text-[#0B1E3A] outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1E3A]"
              />
            </label>

            <label className="block text-sm font-semibold text-[#0B1E3A]">
              Kontak (opsional)
              <input
                value={senderContact}
                onChange={(event) => setSenderContact(event.target.value)}
                placeholder="Nomor HP / email / departemen"
                className="mt-1 w-full rounded-xl border border-[#D6DCE5] bg-[#F8FAFC] px-3 py-3 text-sm text-[#0B1E3A] outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1E3A]"
              />
            </label>
          </div>

          {message ? (
            <p className="rounded-xl border border-[#EED98A] bg-[#FFF8D9] p-3 text-sm text-[#334155]">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#0B1E3A] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
            style={{ color: "white" }}
          >
            {submitting ? "Mengirim..." : "Kirim Saran"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditableField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-[#0B1E3A]">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-[#D6DCE5] bg-white px-3 py-3 text-sm text-[#0B1E3A] outline-none focus:ring-2 focus:ring-[#0B1E3A]"
      />
    </label>
  );
}