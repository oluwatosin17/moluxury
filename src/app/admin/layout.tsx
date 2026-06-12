import AdminSidebar from "@/components/admin/sidebar";
import Script from "next/script";
import { AdminNavProvider } from "@/lib/admin-nav-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminNavProvider>
      <div className="min-h-screen bg-[#0e0f11]" style={{ fontFamily: "var(--font-inter-tight)" }}>
        <Script src="https://widget.cloudinary.com/v2.0/global/all.js" strategy="beforeInteractive" />
        <AdminSidebar />
        {/* On mobile: no left margin (sidebar is an overlay drawer).
            On desktop: shift content right of the 240 px sidebar. */}
        <div className="lg:ml-[240px] flex flex-col min-h-screen">
          {children}
        </div>
      </div>
    </AdminNavProvider>
  );
}
