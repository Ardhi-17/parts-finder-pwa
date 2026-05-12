import PageHeader from "@/components/PageHeader";
import AdminGuard from "@/components/AdminGuard";

export default function UploadPreviewPage() {
  return (
    <div>
      <PageHeader
        title="Preview Upload"
        subtitle="Halaman ini disiapkan untuk preview data sebelum publish."
      />
      <div className="p-4">
        <AdminGuard title="Preview upload">
          <p className="text-sm text-gray-500">
            Untuk MVP, preview sudah ditampilkan di halaman Upload.
          </p>
        </AdminGuard>
      </div>
    </div>
  );
}
