"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAdminNav } from "@/lib/admin-nav-context";

const NAV = [
  { href: "/admin/dashboard",  label: "Dashboard",  icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>
  )},
  { href: "/admin/products",   label: "Products",   icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4.5A2.5 2.5 0 014.5 2h7A2.5 2.5 0 0114 4.5v7a2.5 2.5 0 01-2.5 2.5h-7A2.5 2.5 0 012 11.5v-7z" stroke="currentColor" strokeWidth="1.2"/><path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
  )},
  { href: "/admin/categories", label: "Categories", icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
  )},
  { href: "/admin/analytics",  label: "Analytics",  icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12l3.5-4 3 2.5L12 5l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 14h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
  )},
  { href: "/admin/orders",     label: "Orders",     icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
  )},
  { href: "/admin/bookings",   label: "Bookings",   icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
  )},
  { href: "/admin/media",      label: "Media",      icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="5.5" cy="6.5" r="1" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 11l3.5-3 2.5 2 2-2 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { href: "/admin/settings",   label: "Settings",   icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.42M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
  )},
];

function NavContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[rgba(255,255,255,0.07)]">
        <span className="font-cormorant italic text-[22px] tracking-[-0.5px] text-[#e8e4df]">MoLuxury</span>
        <p className="font-inter-tight text-[10px] tracking-[2px] uppercase text-[#888078] mt-0.5">Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-inter-tight text-[13px] transition-colors group ${
                active
                  ? "bg-[#c9a96e]/10 text-[#c9a96e]"
                  : "text-[#888078] hover:text-[#e8e4df] hover:bg-[rgba(255,255,255,0.04)]"
              }`}
            >
              <span className={active ? "text-[#c9a96e]" : "text-[#888078] group-hover:text-[#e8e4df]"}>
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* View site + sign out */}
      <div className="px-3 pb-5 space-y-1 border-t border-[rgba(255,255,255,0.07)] pt-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-inter-tight text-[13px] text-[#888078] hover:text-[#e8e4df] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M10 2h4v4M9 7l5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          View live site
        </a>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-inter-tight text-[13px] text-[#888078] hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 8h8M11 5l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 3H3a1 1 0 00-1 1v8a1 1 0 001 1h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          Sign out
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar() {
  const { open, close } = useAdminNav();

  return (
    <>
      {/* ── Desktop: always-visible fixed sidebar ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[240px] bg-[#16181d] border-r border-[rgba(255,255,255,0.07)] flex-col z-40">
        <NavContent />
      </aside>

      {/* ── Mobile: slide-in drawer ── */}
      {/* Backdrop */}
      <div
        onClick={close}
        className={`lg:hidden fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      {/* Drawer panel */}
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-[#16181d] border-r border-[rgba(255,255,255,0.07)] flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button inside drawer */}
        <button
          onClick={close}
          aria-label="Close menu"
          className="absolute top-4 right-4 p-1.5 rounded-[6px] text-[#888078] hover:text-[#e8e4df] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
        <NavContent onNavClick={close} />
      </aside>
    </>
  );
}
