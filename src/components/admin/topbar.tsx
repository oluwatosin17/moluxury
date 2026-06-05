"use client";
interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}
export default function AdminTopbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <div className="h-[60px] flex items-center justify-between px-8 border-b border-[rgba(255,255,255,0.07)] shrink-0">
      <div>
        <h1 className="font-inter-tight font-medium text-[15px] text-[#e8e4df]">{title}</h1>
        {subtitle && <p className="font-inter-tight text-[11px] text-[#888078] mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
