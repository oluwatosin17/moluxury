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

// ─── Date presets ─────────────────────────────────────────────────────────────

type Preset = "today" | "7d" | "30d" | "90d" | "year" | "custom";

function getDateRange(preset: Preset, custom?: { from: string; to: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const ago   = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
  if (preset === "today")  return { from: today, to: today };
  if (preset === "7d")     return { from: ago(6),  to: today };
  if (preset === "30d")    return { from: ago(29), to: today };
  if (preset === "90d")    return { from: ago(89), to: today };
  if (preset === "year")   return { from: `${new Date().getFullYear()}-01-01`, to: today };
  return custom ?? { from: ago(29), to: today };
}

// ─── Formatters ──────────────────────────────────────────────────────────────

function fmt(n: number) { return `₦${n.toLocaleString("en-NG")}`; }

/** Abbreviated — ₦195K, ₦1.2M */
function fmtK(n: number): string {
  if (n >= 1_000_000) return `₦${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `₦${Math.round(n / 1_000)}K`;
  return n === 0 ? "₦0" : `₦${n}`;
}
function fmtCount(n: number): string {
  return n >= 1000 ? `${+(n / 1000).toFixed(1)}K` : String(n);
}
function fmtDate(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function fmtDateLong(s: string) {
  return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Catmull-Rom smooth path ──────────────────────────────────────────────────

function smoothPath(pts: [number, number][], tension = 0.35): string {
  if (pts.length < 2) return "";
  if (pts.length === 2)
    return `M ${pts[0][0]},${pts[0][1]} L ${pts[1][0]},${pts[1][1]}`;
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    d += ` C ${p1[0] + (p2[0] - p0[0]) * tension},${p1[1] + (p2[1] - p0[1]) * tension}` +
         ` ${p2[0] - (p3[0] - p1[0]) * tension},${p2[1] - (p3[1] - p1[1]) * tension}` +
         ` ${p2[0]},${p2[1]}`;
  }
  return d;
}

// ─── Multi-series Area Chart ──────────────────────────────────────────────────

interface Series { key: string; values: number[]; color: string; label: string; formatY?: (v: number) => string }

function MultiLineChart({ series, labels, height = 220 }: {
  series: Series[];
  labels: string[];
  height?: number;
}) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hoverIdx, setHoverIdx]     = useState<number | null>(null);
  const [tooltipX, setTooltipX]     = useState(0);
  const [tooltipSide, setTooltipSide] = useState<"left" | "right">("right");

  const VW = 800; // viewBox width
  const PAD_LEFT = 52; const PAD_RIGHT = 16; const PAD_TOP = 12; const PAD_BOT = 28;
  const innerW = VW - PAD_LEFT - PAD_RIGHT;
  const innerH = height - PAD_TOP - PAD_BOT;

  const n = labels.length;

  // Normalize each series to [0, innerH] independently so they all fill the chart nicely
  function buildSeries(s: Series) {
    const max = Math.max(...s.values, 1);
    const pts: [number, number][] = s.values.map((v, i) => [
      PAD_LEFT + (i / Math.max(n - 1, 1)) * innerW,
      PAD_TOP + innerH - (v / max) * innerH,
    ]);
    return { ...s, max, pts };
  }

  const built = series.map(buildSeries);

  // Use first series for Y-axis labels
  const primaryMax = built[0]?.max ?? 1;
  const primaryFmt = built[0]?.formatY ?? fmtK;
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * primaryMax));

  function px(i: number) { return PAD_LEFT + (i / Math.max(n - 1, 1)) * innerW; }

  const handleMouse = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || n === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const xRel = (e.clientX - rect.left) / rect.width;
    const svgX  = xRel * VW;
    const idx   = Math.round((svgX - PAD_LEFT) / (innerW / Math.max(n - 1, 1)));
    const clamped = Math.max(0, Math.min(n - 1, idx));
    setHoverIdx(clamped);
    // Decide which side to show tooltip
    setTooltipX((clamped / Math.max(n - 1, 1)) * 100);
    setTooltipSide(clamped > n * 0.65 ? "left" : "right");
  }, [n, innerW]);

  // X-axis label frequency — show ~7 labels max
  const xStep = Math.max(1, Math.floor(n / 7));

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Floating tooltip */}
      {hoverIdx !== null && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${tooltipX}%`,
            top: "8px",
            transform: tooltipSide === "right" ? "translateX(8px)" : "translateX(calc(-100% - 8px))",
          }}
        >
          <div className="bg-[#0e0f11] border border-[rgba(255,255,255,0.12)] rounded-[10px] px-3.5 py-2.5 shadow-xl min-w-[130px]">
            <p className="font-inter-tight text-[11px] text-[#888078] mb-2">{labels[hoverIdx]}</p>
            {built.map(s => (
              <div key={s.key} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="font-inter-tight text-[11px] text-[#888078]">{s.label}</span>
                </div>
                <span className="font-inter-tight text-[12px] text-[#e8e4df] font-medium">
                  {(s.formatY ?? fmtK)(s.values[hoverIdx])}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${height}`}
        className="w-full"
        style={{ overflow: "visible" }}
        onMouseMove={handleMouse}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          {built.map(s => (
            <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={s.color} stopOpacity="0.2" />
              <stop offset="80%"  stopColor={s.color} stopOpacity="0.03" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
          <clipPath id="chart-clip">
            <rect x={PAD_LEFT} y={PAD_TOP} width={innerW} height={innerH} />
          </clipPath>
        </defs>

        {/* Y-axis grid lines + labels */}
        {gridVals.map((v, i) => {
          const y = PAD_TOP + innerH - (v / primaryMax) * innerH;
          return (
            <g key={i}>
              <line x1={PAD_LEFT} y1={y} x2={VW - PAD_RIGHT} y2={y}
                stroke="rgba(255,255,255,0.05)" strokeWidth="1"
                strokeDasharray={i === 0 ? "none" : "3 4"}
              />
              <text x={PAD_LEFT - 6} y={y + 4} textAnchor="end"
                fontSize="10" fill="#888078" fontFamily="Inter Tight, sans-serif"
              >
                {primaryFmt(v)}
              </text>
            </g>
          );
        })}

        {/* X-axis baseline */}
        <line x1={PAD_LEFT} y1={PAD_TOP + innerH} x2={VW - PAD_RIGHT} y2={PAD_TOP + innerH}
          stroke="rgba(255,255,255,0.07)" strokeWidth="1"
        />

        {/* Area fills + smooth lines — drawn with clipPath so they don't bleed */}
        <g clipPath="url(#chart-clip)">
          {built.map(s => {
            if (s.pts.length < 2) return null;
            const linePath = smoothPath(s.pts);
            const areaPath = `${linePath} L ${s.pts[s.pts.length - 1][0]},${PAD_TOP + innerH} L ${s.pts[0][0]},${PAD_TOP + innerH} Z`;
            return (
              <g key={s.key}>
                <path d={areaPath} fill={`url(#g-${s.key})`} />
                <path d={linePath} fill="none" stroke={s.color} strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </g>
            );
          })}
        </g>

        {/* X-axis labels */}
        {labels.map((lbl, i) => {
          if (i % xStep !== 0 && i !== n - 1) return null;
          return (
            <text key={i} x={px(i)} y={height - 4} textAnchor="middle"
              fontSize="9.5" fill="#888078" fontFamily="Inter Tight, sans-serif"
            >
              {lbl}
            </text>
          );
        })}

        {/* Hover crosshair + dots */}
        {hoverIdx !== null && (
          <>
            <line
              x1={px(hoverIdx)} y1={PAD_TOP}
              x2={px(hoverIdx)} y2={PAD_TOP + innerH}
              stroke="rgba(255,255,255,0.12)" strokeWidth="1"
            />
            {built.map(s => {
              if (!s.pts[hoverIdx]) return null;
              const [cx, cy] = s.pts[hoverIdx];
              return (
                <g key={s.key}>
                  <circle cx={cx} cy={cy} r="6" fill={s.color} opacity="0.2" />
                  <circle cx={cx} cy={cy} r="3.5" fill={s.color} stroke="#0e0f11" strokeWidth="1.5" />
                </g>
              );
            })}
          </>
        )}
      </svg>
    </div>
  );
}

// ─── Ring Donut Chart (stroke-dasharray approach) ─────────────────────────────

function DonutChart({ data, colors }: { data: Record<string, number>; colors: Record<string, string> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const total   = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return <p className="font-inter-tight text-[13px] text-[#888078]">No data yet</p>;

  const R   = 36;
  const CX  = 50; const CY = 50;
  const circ = 2 * Math.PI * R;
  const GAP  = circ * 0.02; // 2% gap between segments
  let cumOffset = 0; // running dashOffset (in px along circumference)

  return (
    <div className="flex items-start gap-5">
      {/* Ring */}
      <svg viewBox="0 0 100 100" className="w-[90px] h-[90px] shrink-0 -rotate-90">
        {entries.map(([status, count]) => {
          const pct      = count / total;
          const segLen   = pct * circ - GAP;
          const dashArr  = `${Math.max(0, segLen)} ${circ}`;
          const dashOff  = -cumOffset + GAP / 2;
          cumOffset     += pct * circ;
          return (
            <circle key={status}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={colors[status] ?? "#888078"}
              strokeWidth="12"
              strokeDasharray={dashArr}
              strokeDashoffset={dashOff}
              strokeLinecap="butt"
            />
          );
        })}
        {/* Centre total */}
        <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle"
          fontSize="18" fill="#e8e4df" fontFamily="Cormorant Garamond, serif"
          fontStyle="italic" className="rotate-90"
          transform={`rotate(90 ${CX} ${CY})`}
        >
          {total}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex-1 space-y-2 pt-1">
        {entries.map(([status, count]) => (
          <div key={status} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[status] ?? "#888078" }} />
            <span className="font-inter-tight text-[12px] text-[#888078] capitalize flex-1">
              {status.replace(/_/g, " ")}
            </span>
            <span className="font-inter-tight text-[12px] text-[#e8e4df]">{count}</span>
            <span className="font-inter-tight text-[10px] text-[#888078] w-8 text-right">
              {Math.round((count / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top Products Chart ────────────────────────────────────────────────────────

function TopProductsChart({ products }: { products: AnalyticsData["topProducts"] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const totalRev = products.reduce((s, p) => s + p.revenue, 0) || 1;
  const maxRev   = products[0]?.revenue ?? 1;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-[#888078]">
          <rect x="4" y="16" width="4" height="12" rx="1" fill="currentColor" opacity="0.3"/>
          <rect x="10" y="10" width="4" height="18" rx="1" fill="currentColor" opacity="0.5"/>
          <rect x="16" y="6" width="4" height="22" rx="1" fill="currentColor" opacity="0.7"/>
          <rect x="22" y="12" width="4" height="16" rx="1" fill="currentColor" opacity="0.4"/>
        </svg>
        <p className="font-inter-tight text-[13px] text-[#888078]">No orders in this range</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((p, i) => {
        const pct = (p.revenue / maxRev) * 100;
        const sharePct = Math.round((p.revenue / totalRev) * 100);
        return (
          <div key={p.slug} className="group">
            <div className="flex items-center gap-3 mb-1.5">
              <span className="font-inter-tight text-[11px] text-[#888078] w-4 text-right shrink-0">{i + 1}</span>
              <div className="relative w-7 h-8 rounded-[3px] overflow-hidden bg-[#1e2028] shrink-0">
                <Image src={getImageUrl(p.image)} alt={p.name} fill className="object-cover" unoptimized />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <span className="font-inter-tight text-[12px] text-[#e8e4df] truncate">{p.name}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-inter-tight text-[10px] text-[#888078]">{sharePct}%</span>
                  <span className="font-inter-tight text-[13px] text-[#c9a96e]">{fmtK(p.revenue)}</span>
                </div>
              </div>
            </div>
            {/* Bar */}
            <div className="ml-7 h-[5px] bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: mounted ? `${pct}%` : "0%",
                  transition: `width 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 60}ms`,
                  background: `linear-gradient(90deg, #c9a96e, #d4b87a)`,
                }}
              />
            </div>
            <div className="ml-7 mt-1 font-inter-tight text-[10px] text-[#888078]">
              {p.units} unit{p.units !== 1 ? "s" : ""} sold
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent = false, pill
}: {
  label: string; value: string | number; sub?: string; accent?: boolean;
  pill?: { text: string; positive: boolean };
}) {
  return (
    <div className={`bg-[#16181d] border rounded-[12px] p-5 ${accent ? "border-[#c9a96e]/25" : "border-[rgba(255,255,255,0.07)]"}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078]">{label}</p>
        {pill && (
          <span className={`font-inter-tight text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
            pill.positive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
          }`}>
            {pill.text}
          </span>
        )}
      </div>
      <p className={`font-cormorant italic leading-none tracking-[-2px] ${
        accent ? "text-[#c9a96e] text-[36px]" : "text-[#e8e4df] text-[34px]"
      }`}>
        {value}
      </p>
      {sub && <p className="font-inter-tight text-[11px] text-[#888078] mt-2">{sub}</p>}
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESETS: { key: Preset; label: string }[] = [
  { key: "today", label: "Today" }, { key: "7d", label: "7 days" },
  { key: "30d",   label: "30 days" }, { key: "90d",   label: "90 days" },
  { key: "year",  label: "This year" }, { key: "custom", label: "Custom" },
];

type ChartMetric = "revenue" | "orders" | "bookings" | "all";

const ORDER_COLORS: Record<string, string> = {
  pending: "#f59e0b", payment_received: "#3b82f6", processing: "#8b5cf6",
  shipped: "#06b6d4", delivered: "#10b981", cancelled: "#ef4444", refunded: "#6b7280",
};
const BOOKING_COLORS: Record<string, string> = {
  new: "#3b82f6", contacted: "#f59e0b", confirmed: "#8b5cf6",
  completed: "#10b981", no_show: "#ef4444", cancelled: "#6b7280",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [preset, setPreset]         = useState<Preset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo]     = useState("");
  const [metric, setMetric]         = useState<ChartMetric>("revenue");
  const [data, setData]             = useState<AnalyticsData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const fetchData = useCallback(() => {
    const range = getDateRange(preset, preset === "custom" ? { from: customFrom, to: customTo } : undefined);
    if (!range.from || !range.to) return;
    setLoading(true); setError(null);
    fetch(`/api/admin/analytics?from=${range.from}&to=${range.to}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load analytics"); setLoading(false); });
  }, [preset, customFrom, customTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build series for the chart
  const ts = data?.timeSeries ?? [];
  const labels = ts.map(d => fmtDate(d.date));

  const allSeries: Series[] = [
    { key: "revenue",  values: ts.map(d => d.revenue),  color: "#c9a96e", label: "Revenue",  formatY: fmtK },
    { key: "orders",   values: ts.map(d => d.orders),   color: "#3b82f6", label: "Orders",   formatY: fmtCount },
    { key: "bookings", values: ts.map(d => d.bookings), color: "#10b981", label: "Bookings", formatY: fmtCount },
  ];
  const activeSeries = metric === "all" ? allSeries : allSeries.filter(s => s.key === metric);

  const hasData = ts.some(d =>
    metric === "all"
      ? d.revenue > 0 || d.orders > 0 || d.bookings > 0
      : metric === "revenue" ? d.revenue > 0
      : metric === "orders"  ? d.orders > 0
      : d.bookings > 0
  );

  // Week-over-week for revenue card
  const last7rev  = ts.slice(-7).reduce((s, d) => s + d.revenue, 0);
  const prev7rev  = ts.slice(-14, -7).reduce((s, d) => s + d.revenue, 0);
  const wowPct    = prev7rev > 0 ? Math.round(((last7rev - prev7rev) / prev7rev) * 100) : null;

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar
        title="Analytics"
        subtitle={data ? `${fmtDateLong(data.range.from)} — ${fmtDateLong(data.range.to)}` : "Loading…"}
      />

      <div className="flex-1 px-8 py-6 space-y-7 overflow-y-auto">

        {/* ── Date filter bar ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-[#16181d] border border-[rgba(255,255,255,0.07)] rounded-[10px] p-1 gap-0.5">
            {PRESETS.map(p => (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                className={`px-3.5 py-1.5 rounded-[7px] font-inter-tight text-[12px] transition-all cursor-pointer ${
                  preset === p.key
                    ? "bg-[#c9a96e] text-[#0e0f11] font-medium shadow-sm"
                    : "text-[#888078] hover:text-[#e8e4df]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {preset === "custom" && (
            <div className="flex items-center gap-2">
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="bg-[#16181d] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-3 py-1.5 font-inter-tight text-[12px] text-[#e8e4df] outline-none focus:border-[#c9a96e]/40"
              />
              <span className="font-inter-tight text-[12px] text-[#888078]">→</span>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="bg-[#16181d] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-3 py-1.5 font-inter-tight text-[12px] text-[#e8e4df] outline-none focus:border-[#c9a96e]/40"
              />
              <button onClick={fetchData} disabled={!customFrom || !customTo}
                className="px-4 py-1.5 bg-[#c9a96e] text-[#0e0f11] font-inter-tight text-[12px] font-medium rounded-[8px] disabled:opacity-40 cursor-pointer hover:bg-[#d4b87a] transition-colors"
              >Apply</button>
            </div>
          )}
        </div>

        {error && <p className="font-inter-tight text-[13px] text-red-400">{error}</p>}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-7 h-7 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
            <p className="font-inter-tight text-[12px] text-[#888078]">Loading analytics…</p>
          </div>
        ) : data && (
          <>
            {/* ── KPI row ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                label="Revenue" accent
                value={fmtK(data.orders.totalRevenue)}
                sub={data.orders.total > 0 ? `from ${data.orders.total} order${data.orders.total !== 1 ? "s" : ""}` : "No orders yet"}
                pill={wowPct !== null ? { text: `${wowPct >= 0 ? "+" : ""}${wowPct}% WoW`, positive: wowPct >= 0 } : undefined}
              />
              <StatCard
                label="Avg order"
                value={fmtK(data.orders.avgOrderValue)}
                sub="Per order value"
              />
              <StatCard
                label="Paid revenue"
                value={fmtK(data.orders.paidRevenue)}
                sub="Confirmed payments"
              />
              <StatCard
                label="Bookings"
                value={data.bookings.total}
                sub={data.bookings.total > 0 ? `${data.bookings.byStatus?.new ?? 0} new` : "No bookings yet"}
              />
            </div>

            {/* ── All-time row ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="All-time revenue" value={fmtK(data.allTime.revenue)} accent />
              <StatCard label="All-time orders"  value={data.allTime.orders} />
              <StatCard label="All-time bookings" value={data.allTime.bookings} />
              <div className="bg-[#16181d] border border-[rgba(255,255,255,0.07)] rounded-[12px] p-5">
                <p className="font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078] mb-3">Products</p>
                <p className="font-cormorant italic text-[34px] leading-none tracking-[-2px] text-[#e8e4df]">{data.products.total}</p>
                <div className="flex gap-1 mt-2.5">
                  <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-[6px] px-2 py-1 text-center">
                    <p className="font-inter-tight text-[11px] text-green-400 font-medium">{data.products.published}</p>
                    <p className="font-inter-tight text-[9px] text-green-400/60">live</p>
                  </div>
                  <div className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[6px] px-2 py-1 text-center">
                    <p className="font-inter-tight text-[11px] text-[#888078] font-medium">{data.products.draft}</p>
                    <p className="font-inter-tight text-[9px] text-[#888078]/60">draft</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Main chart ───────────────────────────────────────────────── */}
            <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-inter-tight font-medium text-[14px] text-[#e8e4df]">Performance over time</h2>
                  <p className="font-inter-tight text-[11px] text-[#888078] mt-0.5">
                    {ts.length} day{ts.length !== 1 ? "s" : ""} · hover to inspect
                  </p>
                </div>

                {/* Metric tabs */}
                <div className="flex gap-1 bg-[#0e0f11] rounded-[8px] p-1">
                  {([
                    { key: "revenue",  label: "Revenue",  color: "#c9a96e" },
                    { key: "orders",   label: "Orders",   color: "#3b82f6" },
                    { key: "bookings", label: "Bookings", color: "#10b981" },
                    { key: "all",      label: "All",      color: "" },
                  ] as { key: ChartMetric; label: string; color: string }[]).map(m => (
                    <button
                      key={m.key}
                      onClick={() => setMetric(m.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] font-inter-tight text-[12px] transition-all cursor-pointer ${
                        metric === m.key ? "bg-[#16181d] text-[#e8e4df] shadow-sm" : "text-[#888078] hover:text-[#e8e4df]"
                      }`}
                    >
                      {m.color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />}
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {!hasData ? (
                <div className="h-52 flex flex-col items-center justify-center gap-2">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="text-[#888078]">
                    <path d="M4 28L12 18l6 6 6-8 8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
                    <path d="M4 28L12 20l6 5 6-9 8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="font-inter-tight text-[13px] text-[#888078]">No data in this period</p>
                </div>
              ) : (
                <MultiLineChart series={activeSeries} labels={labels} height={220} />
              )}

              {/* Summary numbers below chart */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-[rgba(255,255,255,0.05)]">
                {[
                  { label: "Total revenue", value: fmt(data.orders.totalRevenue) },
                  { label: "Total orders",  value: data.orders.total },
                  { label: "Total bookings", value: data.bookings.total },
                ].map(c => (
                  <div key={c.label}>
                    <p className="font-inter-tight text-[11px] text-[#888078] mb-1">{c.label}</p>
                    <p className="font-inter-tight font-medium text-[15px] text-[#e8e4df]">{c.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Bottom grid ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-6">

              {/* Top products */}
              <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5">
                <h2 className="font-inter-tight font-medium text-[14px] text-[#e8e4df] mb-0.5">Top products</h2>
                <p className="font-inter-tight text-[11px] text-[#888078] mb-5">By revenue in selected range</p>
                <TopProductsChart products={data.topProducts} />
              </section>

              {/* Donut charts */}
              <div className="space-y-4">
                <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5">
                  <h2 className="font-inter-tight font-medium text-[14px] text-[#e8e4df] mb-4">Orders by status</h2>
                  <DonutChart data={data.orders.byStatus} colors={ORDER_COLORS} />
                </section>
                <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5">
                  <h2 className="font-inter-tight font-medium text-[14px] text-[#e8e4df] mb-4">Bookings by status</h2>
                  <DonutChart data={data.bookings.byStatus} colors={BOOKING_COLORS} />
                </section>
              </div>
            </div>

            {/* ── Recent activity ──────────────────────────────────────────── */}
            <section className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between">
                <h2 className="font-inter-tight font-medium text-[14px] text-[#e8e4df]">Recent activity</h2>
                <span className="font-inter-tight text-[11px] text-[#888078]">{data.recentActivity.length} events</span>
              </div>
              {data.recentActivity.length === 0 ? (
                <p className="px-5 py-10 text-center font-inter-tight text-[13px] text-[#888078]">No activity in this period</p>
              ) : (
                <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                  {data.recentActivity.map(a => (
                    <div key={a.id} className="flex items-center justify-between px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          a.type === "order" ? "bg-[#c9a96e]/10" : "bg-blue-500/10"
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${a.type === "order" ? "bg-[#c9a96e]" : "bg-blue-400"}`} />
                        </div>
                        <div>
                          <p className="font-inter-tight text-[13px] text-[#e8e4df]">
                            {a.type === "order" ? `Order — ${fmt(a.amount)}` : `Booking — ${a.service}`}
                          </p>
                          <p className="font-inter-tight text-[11px] text-[#888078] capitalize mt-0.5">
                            {a.status.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                      <span className="font-inter-tight text-[12px] text-[#888078]">
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
