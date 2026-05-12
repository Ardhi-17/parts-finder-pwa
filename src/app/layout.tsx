import "@/styles/globals.css";
import type { Metadata } from "next";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Parts Finder",
  description: "PWA pencarian part service teknisi",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <ServiceWorkerRegister />

          <main className="mx-auto min-h-screen max-w-md bg-white pb-24 shadow-sm">
            {children}
          </main>

          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}