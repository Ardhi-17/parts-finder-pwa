"use client";

import { FormEvent, useEffect, useState } from "react";
import { PartInput } from "@/types/part";

const empty: PartInput = {
  equipment_model: "",
  service_type: "",
  part_no: "",
  description: "",
  qty: "",
  remark: "",
  is_active: true,
};

type PartFormProps = {
  initial?: PartInput;
  onSubmit: (data: PartInput) => Promise<void>;
  submitLabel?: string;
  resetAfterSubmit?: boolean;
};

export default function PartForm({
  initial = empty,
  onSubmit,
  submitLabel = "Simpan Data",
  resetAfterSubmit = true,
}: PartFormProps) {
  const [form, setForm] = useState<PartInput>(initial);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    if (
      !form.equipment_model ||
      !form.service_type ||
      !form.part_no ||
      !form.description ||
      form.qty === "" ||
      form.qty === null ||
      form.qty === undefined
    ) {
      setMessage("Kolom bertanda * wajib diisi.");
      return;
    }

    try {
      setIsSaving(true);

      await onSubmit({
        ...form,
        qty: String(form.qty).trim(),
        remark: form.remark || "",
      });

      setMessage("Data berhasil disimpan.");

      if (resetAfterSubmit) {
        setForm(empty);
      }
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Gagal menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  }

  const input =
    "mt-1 w-full rounded-xl border px-3 py-3 outline-none focus:ring-2 focus:ring-gray-900";

  return (
    <form onSubmit={submit} className="space-y-4 p-4">
      <label className="block text-sm font-medium">
        Model Alat *
        <input
          className={input}
          value={form.equipment_model}
          onChange={(e) =>
            setForm({ ...form, equipment_model: e.target.value })
          }
          placeholder="PC200-10MOCE"
        />
      </label>

      <label className="block text-sm font-medium">
        Jenis Service *
        <input
          className={input}
          value={form.service_type}
          onChange={(e) => setForm({ ...form, service_type: e.target.value })}
          placeholder="PS 500"
        />
      </label>

      <label className="block text-sm font-medium">
        Part No *
        <input
          className={input}
          value={form.part_no}
          onChange={(e) => setForm({ ...form, part_no: e.target.value })}
          placeholder="6736-51-5142"
        />
      </label>

      <label className="block text-sm font-medium">
        Description *
        <input
          className={input}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Engine Oil Filter"
        />
      </label>

      <label className="block text-sm font-medium">
        Qty *
        <input
          className={input}
          type="text"
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: e.target.value })}
          placeholder="1 / 37 ltr / 1 pail"
        />
      </label>

      <label className="block text-sm font-medium">
        Remark
        <input
          className={input}
          value={form.remark || ""}
          onChange={(e) => setForm({ ...form, remark: e.target.value })}
          placeholder="Catatan"
        />
      </label>

      {message ? (
        <p className="rounded-xl bg-gray-100 p-3 text-sm">{message}</p>
      ) : null}

      <button
        disabled={isSaving}
        className="w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {isSaving ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}