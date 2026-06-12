"use client";
import { useAdminNav } from "@/lib/admin-nav-context";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function AdminTopbar({ title, subtitle, actions }: TopbarProps) {
  const { toggle } = useAdminNav();

  return (
    <div className="h-[60px] flex items-center justify-between px-4 sm:px-8 border-b border-[rgba(255,255,255,0.07)] shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — only visible on mobile */}
        <button
          onClick={toggle}
          aria-label="Open menu"
          className="lg:hidden flex-shrink-0 p-1.5 rounded-[6px] text-[#888078] hover:text-[#e8e4df] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="font-inter-tight font-medium text-[14px] sm:text-[15px] text-[#e8e4df] truncate">{title}</h1>
          {subtitle && <p className="font-inter-tight text-[11px] text-[#888078] mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">{actions}</div>}
    </div>
  );
}
