"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import AdminTopbar from "@/components/admin/topbar";
import Image from "next/image";
import { getImageUrl } from "@/lib/supabase/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimePoint { date: string; revenue: number; orders: number; bookings: number }

interface AnalyticsData {
  range: { from: string; to: string };
  products: { total: number; published: number; draft: number };
  orders:   { total: number; totalRevenue: number; paidRevenue: number; avgOrderValue: number; byStatus: Record<string, number> };
  bookings: { total: number; byStatus: Record<string, number> };
  allTime:  { revenue: number; orders: number; bookings: number };
  topProducts: { name: string; slug: string; revenue: number; units: number; image: string }[];
  timeSeries:  TimePoint[];
  recentActivity: (
    | { type: "order";   id: string; date: string; status: string; amount: number }
    | { type: "booking"; id: string; date: string; status: string; service: string }
  )[];
}

// ─── Date range presets ──────────────────────────────────────────────────────

type Preset = "today" | "7d" | "30d" | "90d" | "year" | "custom";

function getDateRange(preset: Preset, custom?: { from: string; to: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const ago   = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
  if (preset === "today")  return { from: today, to: today };
  if (preset === "7d")     return { from: ago(6), to: today };
  if (preset === "30d")    return { from: ago(29), to: today };
  if (preset === "90d")    return { from: ago(89), to: today };
  if (preset === "year") {
    const y = new Date().getFullYear();
    return { from: `${y}-01-01`, to: today };
  }
  return custom ?? { from: ago(29), to: today };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return `₦${n.toLocaleString("en-NG")}`; }
function fmtShort(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function fmtFull(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ─── SVG Area/Line Chart ─────────────────────────────────────────────────────

interface ChartPoint { label: string; value: number }

function AreaChart({
  data,
  color = "#c9a96e",
  formatY = (v: number) => String(v),
  height = 160,
}: {
  data: ChartPoint[];
  color?: string;
  formatY?: (v: number) => string;
  height?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 600; // viewBox width — scales with container

  const max    = Math.max(...data.map(d => d.value), 1);
  const min    = 0;
  const range  = max - min || 1;
  const padX   = 0;
  const padY   = 12;
  const innerH = height - padY * 2;

  const px = (i: number) => padX + (i / Math.max(data.length - 1, 1)) * (W - padX * 2);
  const py = (v: number) => padY + innerH - ((v - min) / range) * innerH;

  const pts = data.map((d, i) => `${px(i)},${py(d.value)}`).join(" L ");
  const path     = data.length > 0 ? `M ${pts}` : "";
  const areaPath = data.length > 0
    ? `M ${px(0)},${py(0)} L ${pts} L ${px(data.length - 1)},${py(0)} Z`
    : "";

  // Y-axis grid lines
  const gridValues = [0, max * 0.25, max * 0.5, max * 0.75, max].map(Math.round);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || data.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const xRel = (e.clientX - rect.left) / rect.width;
    const svgX  = xRel * W;
    const idx   = Math.round(svgX / (W / Math.max(data.length - 1, 1)));
    setHovered(Math.max(0, Math.min(data.length - 1, idx)));
  }, [data]);

  return (
    <div className="relative w-full">
      {/* Tooltip */}
      {hovered !== null && data[hovered] && (
        <div
          className="absolute z-10 bg-[#0e0f11] border border-[rgba(255,255,255,0.12)] rounded-[8px] px-3 py-2 text-[12px] font-inter-tight pointer-events-none"
          style={{
            left: `${(hovered / Math.max(data.length - 1, 1)) * 100}%`,
            transform: "translateX(-50%)",
            top: 0,
          }}
        >
          <p className="text-[#888078]">{data[hovered].label}</p>
          <p className="text-[#e8e4df] font-medium">{formatY(data[hovered].value)}</p>
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${height}`}
        className="w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridValues.map((v, i) => (
          <g key={i}>
            <line
              x1={0} y1={py(v)} x2={W} y2={py(v)}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1"
            />
            <text
              x={W + 6} y={py(v) + 4}
              className="font-inter-tight" fontSize="9" fill="#888078"
              textAnchor="start"
            >
              {formatY(v)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        {areaPath && (
          <path d={areaPath} fill={`url(#grad-${color.replace("#", "")})`} />
        )}

        {/* Line */}
        {path && (
          <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* X-axis labels — show ~6 evenly spaced */}
        {data.map((d, i) => {
          const step = Math.max(1, Math.floor(data.length / 6));
          if (i % step !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={i}
              x={px(i)} y={height + 14}
              textAnchor="middle"
              fontSize="9" fill="#888078"
            >
              {d.label}
            </text>
          );
        })}

        {/* Hover vertical line + dot */}
        {hovered !== null && data[hovered] && (
          <>
            <line
              x1={px(hovered)} y1={padY} x2={px(hovered)} y2={height - padY}
              stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 2"
            />
            <circle
              cx={px(hovered)} cy={py(data[hovered].value)}
              r="4" fill={color} stroke="#0e0f11" strokeWidth="2"
            />
          </>
        )}
      </svg>
    </div>
  );
}

// ─── SVG Donut Chart ─────────────────────────────────────────────────────────

function DonutChart({ data, colors }: { data: Record<string, number>; colors: Record<string, string> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total   = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return <p className="font-inter-tight text-[13px] text-[#888078]">No data yet</p>;

  const R = 40; const CX = 60; const CY = 60;
  let angle = -90;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 120 120" className="w-[100px] h-[100px] shrink-0">
        {entries.map(([status, count]) => {
          const pct   = (count / total) * 360;
          const start = angle;
          angle += pct;
          const end   = angle;
          const large = pct > 180 ? 1 : 0;
          const toRad = (deg: number) => (deg * Math.PI) / 180;
          const sx = CX + R * Math.cos(toRad(start));
          const sy = CY + R * Math.sin(toRad(start));
          const ex = CX + R * Math.cos(toRad(end));
          const ey = CY + R * Math.sin(toRad(end));
          const d  = `M ${CX} ${CY} L ${sx} ${sy} A ${R} ${R} 0 ${large} 1 ${ex} ${ey} Z`;
          return <path key={status} d={d} fill={colors[status] ?? "#888078"} stroke="#16181d" strokeWidth="1.5" />;
        })}
        <circle cx={CX} cy={CY} r={R * 0.55} fill="#16181d" />
        <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="#e8e4df" fontFamily="serif" fontStyle="italic">
          {total}
        </text>
      </svg>
      <div className="space-y-2 flex-1">
        {entries.map(([status, count]) => (
          <div key={status} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[status] ?? "#888078" }} />
              <span className="font-inter-tight text-[11px] text-[#888078] capitalize">{status.replace(/_/g, " ")}</span>
            </div>
            <span className="font-inter-tight text-[11px] text-[#e8e4df]">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top Products Horizontal Bar ─────────────────────────────────────────────

function TopProductsChart({ products }: { products: AnalyticsData["topProducts"] }) {
  const max = products[0]?.revenue ?? 1;
  return (
    <div className="space-y-3">
      {products.map((p, i) => (
        <div key={p.slug} className="flex items-center gap-3">
          <span className="font-inter-tight text-[11px] text-[#888078] w-4 shrink-0 text-right">{i + 1}</span>
          <div className="relative w-8 h-9 rounded-[3px] overflow-hidden bg-[#1e2028] shrink-0">
            <Image src={getImageUrl(p.image)} alt={p.name} fill className="object-cover" unoptimized />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-inter-tight text-[12px] text-[#e8e4df] truncate">{p.name}</span>
              <span className="font-inter-tight text-[12px] text-[#c9a96e] shrink-0 ml-2">{fmt(p.revenue)}</span>
            </div>
            <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(p.revenue / max) * 100}%`, backgroundColor: "#c9a96e" }}
              />
            </div>
            <span className="font-inter-tight text-[10px] text-[#888078]">{p.units} unit{p.units !== 1 ? "s" : ""}</span>
          </div>
        </div>
      ))}
      {products.length === 0 && (
        <p className="font-inter-tight text-[13px] text-[#888078]">No order data in this range</p>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent = false, change }: {
  label: string; value: string | number; sub?: string; accent?: boolean; change?: number;
}) {
  return (
    <div className={`bg-[#16181d] border rounded-[12px] p-5 ${accent ? "border-[#c9a96e]/30" : "border-[rgba(255,255,255,0.07)]"}`}>
      <p className="font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078] mb-2">{label}</p>
      <p className={`font-cormorant italic text-[38px] leading-none tracking-[-2px] ${accent ? "text-[#c9a96e]" : "text-[#e8e4df]"}`}>
        {value}
      </p>
      <div className="flex items-center gap-2 mt-2">
        {sub && <p className="font-inter-tight text-[11px] text-[#888078]">{sub}</p>}
        {change !== undefined && (
          <span className={`font-inter-tight text-[10px] px-1.5 py-0.5 rounded-full ${
            change >= 0
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}>
            {change >= 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PRESETS: { key: Preset; label: string }[] = [
  { key: "today",  label: "Today" },
  { key: "7d",     label: "Last 7 days" },
  { key: "30d",    label: "Last 30 days" },
  { key: "90d",    label: "Last 90 days" },
  { key: "year",   label: "This year" },
  { key: "custom", label: "Custom" },
];

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
  new: "#3b82f6", contacted: "#f59e0b", confirmed: "#8b5cf6",
  completed: "#10b981", no_show: "#ef4444", cancelled: "#6b7280",
};

export default function AnalyticsPage() {
  const [preset, setPreset]           = useState<Preset>("30d");
  const [customFrom, setCustomFrom]   = useState("");
  const [customTo, setCustomTo]       = useState("");
  const [activeChart, setActiveChart] = useState<"revenue" | "orders" | "bookings">("revenue");
  const [data, setData]               = useState<AnalyticsData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const fetchData = useCallback(() => {
    const range = getDateRange(preset, preset === "custom" ? { from: customFrom, to: customTo } : undefined);
    if (!range.from || !range.to) return;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/analytics?from=${range.from}&to=${range.to}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load analytics"); setLoading(false); });
  }, [preset, customFrom, customTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build chart data from timeSeries
  const chartData: ChartPoint[] = (data?.timeSeries ?? []).map(d => ({
    label: fmtShort(d.date),
    value: activeChart === "revenue" ? d.revenue : activeChart === "orders" ? d.orders : d.bookings,
  }));

  const chartColor   = activeChart === "revenue" ? "#c9a96e" : activeChart === "orders" ? "#3b82f6" : "#10b981";
  const chartFormatY = activeChart === "revenue" ? fmt : (v: number) => String(v);

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title="Analytics" subtitle={
        data ? `${fmtFull(data.range.from)} — ${fmtFull(data.range.to)}` : "Loading…"
      } />

      <div className="flex-1 px-8 py-6 space-y-7 overflow-y-auto">

        {/* ── Date range filter ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          {PRESETS.map(p => (
            <button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className={`px-3.5 py-1.5 rounded-full font-inter-tight text-[12px] border transition-colors cursor-pointer ${
                preset === p.key
                  ? "bg-[#c9a96e]/10 border-[#c9a96e]/40 text-[#c9a96e]"
                  : "border-[rgba(255,255,255,0.1)] text-[#888078] hover:border-[rgba(255,255,255,0.2)] hover:text-[#e8e4df]"
              }`}
            >{p.label}</button>
          ))}
          {preset === "custom" && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="bg-[#16181d] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-3 py-1.5 font-inter-tight text-[12px] text-[#e8e4df] outline-none focus:border-[#c9a96e]/40"
              />
              <span className="font-inter-tight text-[12px] text-[#888078]">to</span>
              <input
                type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="bg-[#16181d] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-3 py-1.5 font-inter-tight text-[12px] text-[#e8e4df] outline-none focus:border-[#c9a96e]/40"
              />
              <button
                onClick={fetchData}
                disabled={!customFrom || !customTo}
                className="px-4 py-1.5 bg-[#c9a96e] text-[#0e0f11] font-inter-tight text-[12px] font-medium rounded-[8px] disabled:opacity-40 cursor-pointer hover:bg-[#d4b87a] transition-colors"
              >Apply</button>
            </div>
          )}
        </div>

        {error && <p className="font-inter-tight text-[13px] text-red-400">{error}</p>}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data && (
          <>
            {/* ── Overview stat cards ─────────────────────────────────────── */}
            <section>
              <p className="font-inter-tight text-[10px] tracking-[2px] uppercase text-[#888078] mb-3">
                In selected range
              </p>
              <div className="grid grid-cols-4 gap-4">
                <StatCard label="Revenue"        value={fmt(data.orders.totalRevenue)} accent />
                <StatCard label="Orders"         value={data.orders.total}            sub={`Avg ${fmt(data.orders.avgOrderValue)}`} />
                <StatCard label="Bookings"       value={data.bookings.total} />
                <StatCard label="Paid Revenue"   value={fmt(data.orders.paidRevenue)} sub="Excluding pending" />
              </div>
            </section>

            {/* ── All-time stats ──────────────────────────────────────────── */}
            <section>
              <p className="font-inter-tight text-[10px] tracking-[2px] uppercase text-[#888078] mb-3">All time</p>
              <div className="grid grid-cols-4 gap-4">
                <StatCard label="Total Revenue"  value={fmt(data.allTime.revenue)} accent />
                <StatCard label="Total Orders"   value={data.allTime.orders} />
                <StatCard label="Total Bookings" value={data.allTime.bookings} />
                <div className="bg-[#16181d] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-5">
                  <p className="font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078] mb-2">Products</p>
                  <p className="font-cormorant italic text-[38px] leading-none tracking-[-2px] text-[#e8e4df]">{data.products.total}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="font-inter-tight text-[10px] text-green-400">{data.products.published} live</span>
                    <span className="font-inter-tight text-[10px] text-[#888078]">{data.products.draft} draft{data.products.draft !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Time series chart ───────────────────────────────────────── */}
            <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 pb-8">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-inter-tight font-medium text-[13px] text-[#e8e4df]">Performance over time</h2>
                  <p className="font-inter-tight text-[11px] text-[#888078] mt-0.5">
                    {fmtFull(data.range.from)} — {fmtFull(data.range.to)} · {data.timeSeries.length} days
                  </p>
                </div>
                {/* Chart metric toggle */}
                <div className="flex gap-1 bg-[#0e0f11] rounded-[8px] p-1">
                  {([
                    { key: "revenue",  label: "Revenue",  color: "#c9a96e" },
                    { key: "orders",   label: "Orders",   color: "#3b82f6" },
                    { key: "bookings", label: "Bookings", color: "#10b981" },
                  ] as const).map(m => (
                    <button
                      key={m.key}
                      onClick={() => setActiveChart(m.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] font-inter-tight text-[12px] transition-colors cursor-pointer ${
                        activeChart === m.key ? "bg-[#16181d] text-[#e8e4df]" : "text-[#888078] hover:text-[#e8e4df]"
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              {chartData.every(d => d.value === 0) ? (
                <div className="h-40 flex items-center justify-center">
                  <p className="font-inter-tight text-[13px] text-[#888078]">No {activeChart} data in this period</p>
                </div>
              ) : (
                <AreaChart
                  data={chartData}
                  color={chartColor}
                  formatY={chartFormatY}
                  height={180}
                />
              )}
            </section>

            {/* ── Bottom grid ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-6">

              {/* Top products */}
              <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5">
                <h2 className="font-inter-tight font-medium text-[13px] text-[#e8e4df] mb-1">Top products by revenue</h2>
                <p className="font-inter-tight text-[11px] text-[#888078] mb-5">Based on orders in selected range</p>
                <TopProductsChart products={data.topProducts} />
              </section>

              {/* Status breakdowns */}
              <div className="space-y-4">
                <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5">
                  <h2 className="font-inter-tight font-medium text-[13px] text-[#e8e4df] mb-4">Orders by status</h2>
                  <DonutChart data={data.orders.byStatus}   colors={ORDER_STATUS_COLORS} />
                </section>
                <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5">
                  <h2 className="font-inter-tight font-medium text-[13px] text-[#e8e4df] mb-4">Bookings by status</h2>
                  <DonutChart data={data.bookings.byStatus} colors={BOOKING_STATUS_COLORS} />
                </section>
              </div>
            </div>

            {/* ── Recent activity ─────────────────────────────────────────── */}
            <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between">
                <h2 className="font-inter-tight font-medium text-[13px] text-[#e8e4df]">Recent activity</h2>
                <span className="font-inter-tight text-[11px] text-[#888078]">{data.recentActivity.length} events in range</span>
              </div>
              {data.recentActivity.length === 0 ? (
                <p className="px-5 py-8 font-inter-tight text-[13px] text-[#888078]">No activity in this period</p>
              ) : (
                <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                  {data.recentActivity.map(a => (
                    <div key={a.id} className="flex items-center justify-between px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${a.type === "order" ? "bg-[#c9a96e]" : "bg-blue-400"}`} />
                        <div>
                          <p className="font-inter-tight text-[13px] text-[#e8e4df]">
                            {a.type === "order"
                              ? `Order · ${fmt(a.amount)}`
                              : `Booking · ${a.service}`}
                          </p>
                          <p className="font-inter-tight text-[11px] text-[#888078] capitalize">
                            {a.status.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                      <span className="font-inter-tight text-[12px] text-[#888078] shrink-0">
                        {new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
