"use client";
import { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/topbar";
import Image from "next/image";
import { getImageUrl } from "@/lib/supabase/utils";

interface AnalyticsData {
  products: { total: number; published: number; draft: number };
  orders: {
    total: number;
    totalRevenue: number;
    paidRevenue: number;
    avgOrderValue: number;
    byStatus: Record<string, number>;
  };
  bookings: { total: number; byStatus: Record<string, number> };
  topProducts: { name: string; slug: string; revenue: number; units: number; image: string }[];
  revenueByDay: { date: string; revenue: number; orders: number }[];
  recentActivity: (
    | { type: "order";   id: string; date: string; status: string; amount: number }
    | { type: "booking"; id: string; date: string; status: string; service: string }
  )[];
}

function fmt(n: number) { return `₦${n.toLocaleString("en-NG")}`; }
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function fmtShort(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending:          "#f59e0b",
  payment_received: "#3b82f6",
  processing:       "#8b5cf6",
  shipped:          "#06b6d4",
  delivered:        "#10b981",
  cancelled:        "#ef4444",
  refunded:         "#6b7280",
};

const BOOKING_STATUS_COLORS: Record<string, string> = {
  new:       "#3b82f6",
  contacted: "#f59e0b",
  confirmed: "#8b5cf6",
  completed: "#10b981",
  no_show:   "#ef4444",
  cancelled: "#6b7280",
};

function StatCard({ label, value, sub, accent = false }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`bg-[#16181d] border rounded-[12px] p-5 ${accent ? "border-[#c9a96e]/30" : "border-[rgba(255,255,255,0.07)]"}`}>
      <p className="font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078] mb-2">{label}</p>
      <p className={`font-cormorant italic text-[40px] leading-none tracking-[-2px] ${accent ? "text-[#c9a96e]" : "text-[#e8e4df]"}`}>
        {value}
      </p>
      {sub && <p className="font-inter-tight text-[11px] text-[#888078] mt-2">{sub}</p>}
    </div>
  );
}

function BarChart({ days }: { days: { date: string; revenue: number; orders: number }[] }) {
  const maxRev = Math.max(...days.map(d => d.revenue), 1);
  // Show every 5th label to avoid crowding
  return (
    <div className="flex items-end gap-[3px] h-[120px] w-full">
      {days.map((d, i) => {
        const pct = (d.revenue / maxRev) * 100;
        const showLabel = i === 0 || i === 14 || i === 29 || d.revenue === maxRev;
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#0e0f11] border border-[rgba(255,255,255,0.1)] rounded-[6px] px-2 py-1 text-[10px] font-inter-tight text-[#e8e4df] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              {fmtShort(d.date)}<br />{fmt(d.revenue)}{d.orders > 0 ? ` · ${d.orders} order${d.orders > 1 ? "s" : ""}` : ""}
            </div>
            <div
              className="w-full rounded-[2px] transition-all duration-300"
              style={{
                height: `${Math.max(pct, d.revenue > 0 ? 4 : 1)}%`,
                backgroundColor: d.revenue > 0 ? "#c9a96e" : "rgba(255,255,255,0.06)",
              }}
            />
            {showLabel && (
              <span className="font-inter-tight text-[9px] text-[#888078] whitespace-nowrap">
                {new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusBreakdown({ data, colors }: { data: Record<string, number>; colors: Record<string, string> }) {
  const total = Object.values(data).reduce((s, n) => s + n, 0);
  if (total === 0) return <p className="font-inter-tight text-[13px] text-[#888078]">No data yet</p>;
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-2.5">
      {entries.map(([status, count]) => (
        <div key={status} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-inter-tight text-[12px] capitalize text-[#888078]">
              {status.replace(/_/g, " ")}
            </span>
            <span className="font-inter-tight text-[12px] text-[#e8e4df]">{count}</span>
          </div>
          <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(count / total) * 100}%`, backgroundColor: colors[status] ?? "#888078" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData]     = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load analytics"); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error || !data) return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <p className="font-inter-tight text-[13px] text-red-400">{error ?? "No data"}</p>
    </div>
  );

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar
        title="Analytics"
        subtitle={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
      />

      <div className="flex-1 px-8 py-6 space-y-8 overflow-y-auto">

        {/* ── Overview stat cards ─────────────────────────────────────────── */}
        <section>
          <h2 className="font-inter-tight text-[11px] tracking-[2px] uppercase text-[#888078] mb-4">Overview</h2>
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total Revenue"     value={fmt(data.orders.totalRevenue)}  accent />
            <StatCard label="Confirmed Revenue" value={fmt(data.orders.paidRevenue)}   sub={`${data.orders.total} order${data.orders.total !== 1 ? "s" : ""} total`} />
            <StatCard label="Avg Order Value"   value={fmt(data.orders.avgOrderValue)} />
            <StatCard label="Total Bookings"    value={data.bookings.total} />
          </div>
        </section>

        {/* ── Product stats ────────────────────────────────────────────────── */}
        <section>
          <h2 className="font-inter-tight text-[11px] tracking-[2px] uppercase text-[#888078] mb-4">Products</h2>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Products"  value={data.products.total} />
            <StatCard label="Published"       value={data.products.published} accent sub="Live on storefront" />
            <StatCard label="Drafts"          value={data.products.draft} sub="Hidden from storefront" />
          </div>
        </section>

        {/* ── Revenue chart ────────────────────────────────────────────────── */}
        <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-inter-tight font-medium text-[13px] text-[#e8e4df]">Revenue — Last 30 Days</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-[2px] bg-[#c9a96e]" />
              <span className="font-inter-tight text-[11px] text-[#888078]">Daily revenue</span>
            </div>
          </div>
          <BarChart days={data.revenueByDay} />
          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)] grid grid-cols-3 gap-4">
            {(() => {
              const last7  = data.revenueByDay.slice(-7).reduce((s, d) => s + d.revenue, 0);
              const prev7  = data.revenueByDay.slice(-14, -7).reduce((s, d) => s + d.revenue, 0);
              const pct    = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null;
              const last30 = data.revenueByDay.reduce((s, d) => s + d.orders, 0);
              return (
                <>
                  <div>
                    <p className="font-inter-tight text-[11px] text-[#888078] mb-1">Last 7 days</p>
                    <p className="font-inter-tight text-[15px] text-[#e8e4df]">{fmt(last7)}</p>
                    {pct !== null && (
                      <p className={`font-inter-tight text-[11px] mt-0.5 ${pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {pct >= 0 ? "+" : ""}{pct}% vs prev week
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="font-inter-tight text-[11px] text-[#888078] mb-1">Last 30 days</p>
                    <p className="font-inter-tight text-[15px] text-[#e8e4df]">{fmt(data.revenueByDay.reduce((s, d) => s + d.revenue, 0))}</p>
                  </div>
                  <div>
                    <p className="font-inter-tight text-[11px] text-[#888078] mb-1">Orders (30d)</p>
                    <p className="font-inter-tight text-[15px] text-[#e8e4df]">{last30}</p>
                  </div>
                </>
              );
            })()}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-6">

          {/* ── Top products ─────────────────────────────────────────────── */}
          <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.07)]">
              <h2 className="font-inter-tight font-medium text-[13px] text-[#e8e4df]">Top Products by Revenue</h2>
              <p className="font-inter-tight text-[11px] text-[#888078] mt-0.5">Based on completed orders</p>
            </div>
            {data.topProducts.length === 0 ? (
              <p className="px-5 py-8 font-inter-tight text-[13px] text-[#888078]">No order data yet</p>
            ) : (
              <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                {data.topProducts.map((p, i) => (
                  <div key={p.slug} className="flex items-center gap-3 px-5 py-3">
                    <span className="font-inter-tight text-[12px] text-[#888078] w-4 shrink-0">{i + 1}</span>
                    <div className="relative w-8 h-10 rounded-[4px] overflow-hidden shrink-0 bg-[#1e2028]">
                      <Image
                        src={getImageUrl(p.image)}
                        alt={p.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter-tight text-[13px] text-[#e8e4df] truncate">{p.name}</p>
                      <p className="font-inter-tight text-[11px] text-[#888078]">{p.units} unit{p.units !== 1 ? "s" : ""} sold</p>
                    </div>
                    <p className="font-inter-tight text-[13px] text-[#c9a96e] shrink-0">{fmt(p.revenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Status breakdowns ─────────────────────────────────────────── */}
          <div className="space-y-4">
            <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 space-y-4">
              <h2 className="font-inter-tight font-medium text-[13px] text-[#e8e4df]">Orders by Status</h2>
              <StatusBreakdown data={data.orders.byStatus} colors={ORDER_STATUS_COLORS} />
            </section>
            <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 space-y-4">
              <h2 className="font-inter-tight font-medium text-[13px] text-[#e8e4df]">Bookings by Status</h2>
              <StatusBreakdown data={data.bookings.byStatus} colors={BOOKING_STATUS_COLORS} />
            </section>
          </div>
        </div>

        {/* ── Recent activity ──────────────────────────────────────────────── */}
        <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.07)]">
            <h2 className="font-inter-tight font-medium text-[13px] text-[#e8e4df]">Recent Activity</h2>
          </div>
          {data.recentActivity.length === 0 ? (
            <p className="px-5 py-8 font-inter-tight text-[13px] text-[#888078]">No activity yet</p>
          ) : (
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {data.recentActivity.map(a => (
                <div key={a.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${a.type === "order" ? "bg-[#c9a96e]" : "bg-blue-400"}`} />
                    <div>
                      <p className="font-inter-tight text-[13px] text-[#e8e4df]">
                        {a.type === "order"
                          ? `New order — ${fmt(a.amount)}`
                          : `Booking — ${a.service}`}
                      </p>
                      <p className="font-inter-tight text-[11px] text-[#888078] capitalize">
                        {a.type} · {a.status.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                  <span className="font-inter-tight text-[12px] text-[#888078]">{fmtDate(a.date)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
