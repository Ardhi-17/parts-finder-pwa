"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import PartForm from "@/components/PartForm";
import AdminGuard from "@/components/AdminGuard";
import { getPartById, updatePart } from "@/lib/partsApi";
import { Part, PartInput } from "@/types/part";

export default function EditPartPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPart() {
      try {
        setLoading(true);
        const data = await getPartById(id);

        if (!data) {
          setMessage("Data part tidak ditemukan.");
          return;
        }

        setPart(data);
      } catch (error: any) {
        console.error(error);
        setMessage(error.message || "Gagal mengambil data part.");
      } finally {
        setLoading(false);
      }
    }

    loadPart();
  }, [id]);

  async function handleSubmit(input: PartInput): Promise<void> {
    await updatePart(id, input);
    router.push("/parts");
  }

  if (loading) {
    return (
      <div className="p-4">
        <PageHeader title="Edit Data" subtitle="Memuat data part..." />
        <AdminGuard title="Edit data">
          <p className="p-4 text-sm text-gray-600">Loading...</p>
        </AdminGuard>
      </div>
    );
  }

  if (!part) {
    return (
      <div>
        <PageHeader title="Edit Data" subtitle="Data tidak ditemukan." />
        <div className="p-4">
          <p className="rounded-xl bg-gray-100 p-3 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  const initial: PartInput = {
    equipment_model: part.equipment_model,
    service_type: part.service_type,
    part_no: part.part_no,
    description: part.description,
    qty: part.qty,
    remark: part.remark || "",
    version_id: part.version_id,
    is_active: part.is_active ?? true,
  };

  return (
    <div>
      <PageHeader
        title="Edit Data Part"
        subtitle="Ubah data yang salah, lalu simpan."
      />

      <AdminGuard title="Edit data">
        <PartForm
          initial={initial}
          onSubmit={handleSubmit}
          submitLabel="Simpan Perubahan"
          resetAfterSubmit={false}
        />
      </AdminGuard>
    </div>
  );
}