import AdminSidebar from "@/components/admin/sidebar";
import Script from "next/script";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0e0f11]" style={{ fontFamily: "var(--font-inter-tight)" }}>
      <Script src="https://widget.cloudinary.com/v2.0/global/all.js" strategy="beforeInteractive" />
      <AdminSidebar />
      <div className="ml-[240px] flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
