import AdminSidebar from "@/components/admin/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0e0f11]" style={{ fontFamily: "var(--font-inter-tight)" }}>
      <AdminSidebar />
      <div className="ml-[240px] flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
