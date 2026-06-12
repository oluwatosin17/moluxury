"use client";
import { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/topbar";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";
import type { Order, OrderStatus } from "@/lib/supabase/types";

const STATUSES: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all",              label: "All" },
  { value: "pending",          label: "Pending" },
  { value: "payment_received", label: "Paid" },
  { value: "processing",       label: "Processing" },
  { value: "shipped",          label: "Shipped" },
  { value: "delivered",        label: "Delivered" },
  { value: "cancelled",        label: "Cancelled" },
];

export default function AdminOrders() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [status, setStatus]   = useState<OrderStatus | "all">("all");
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(0);
  const PER_PAGE = 25;

  useEffect(() => {
    setLoading(true); setError(null);
    fetch("/api/admin/orders")
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); if (!Array.isArray(data)) setError(data.error ?? "Failed to load"); setLoading(false); })
      .catch(() => { setError("Network error"); setLoading(false); });
  }, []);

  const filtered = orders.filter(o => {
    if (status !== "all" && o.status !== status) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return o.customer_name.toLowerCase().includes(q) || o.customer_email.toLowerCase().includes(q) || o.order_ref.toLowerCase().includes(q);
  });

  const pageItems  = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  function fmt(n: number) { return `₦${n.toLocaleString("en-NG")}`; }
  function fmtDate(s: string) { return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title="Orders" subtitle={loading ? "Loading…" : `${filtered.length} orders`} />

      {/* Filters */}
      <div className="px-4 sm:px-8 py-3 sm:py-4 border-b border-[rgba(255,255,255,0.07)] space-y-3">
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search by name, email, or ref…"
          className="w-full sm:max-w-sm bg-[#16181d] border border-[rgba(255,255,255,0.07)] rounded-[8px] px-3 py-2 font-inter-tight text-[13px] text-[#e8e4df] placeholder:text-[#888078] outline-none focus:border-[#c9a96e]/40"
        />
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(s => (
            <button key={s.value} onClick={() => { setStatus(s.value); setPage(0); }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-[6px] font-inter-tight text-[11px] sm:text-[12px] transition-colors cursor-pointer ${
                status === s.value ? "bg-[rgba(255,255,255,0.08)] text-[#e8e4df]" : "text-[#888078] hover:text-[#e8e4df]"
              }`}
            >{s.label}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error ? (
          <p className="px-4 sm:px-8 py-10 font-inter-tight text-[13px] text-red-400">{error}</p>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pageItems.length === 0 ? (
          <p className="px-4 sm:px-8 py-16 text-center font-inter-tight text-[13px] text-[#888078]">
            {search || status !== "all" ? "No orders match your filter" : "No orders yet"}
          </p>
        ) : (
          <>
            {/* ── Mobile card list ── */}
            <div className="lg:hidden divide-y divide-[rgba(255,255,255,0.05)]">
              {pageItems.map(o => (
                <Link key={o.id} href={`/admin/orders/${o.id}`}
                  className="flex items-start justify-between px-4 py-4 hover:bg-[rgba(255,255,255,0.01)] transition-colors"
                >
                  <div className="space-y-1 min-w-0 mr-3">
                    <p className="font-mono text-[12px] text-[#c9a96e]">{o.order_ref}</p>
                    <p className="font-inter-tight text-[13px] text-[#e8e4df] truncate">{o.customer_name}</p>
                    <p className="font-inter-tight text-[11px] text-[#888078]">
                      {Array.isArray(o.items) ? o.items.length : 0} item{(Array.isArray(o.items) && o.items.length !== 1) ? "s" : ""}
                      {" · "}{fmtDate(o.created_at)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1.5">
                    <p className="font-inter-tight text-[13px] text-[#e8e4df]">{fmt(o.subtotal)}</p>
                    <OrderStatusBadge status={o.status} />
                  </div>
                </Link>
              ))}
            </div>

            {/* ── Desktop table ── */}
            <table className="hidden lg:table w-full">
              <thead className="sticky top-0 bg-[#0e0f11]">
                <tr className="border-b border-[rgba(255,255,255,0.07)]">
                  {["Ref", "Customer", "Items", "Total", "Status", "Date", ""].map(h => (
                    <th key={h} className="px-6 py-3 text-left font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map(o => (
                  <tr key={o.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                    <td className="px-6 py-4 font-mono text-[12px] text-[#c9a96e]">{o.order_ref}</td>
                    <td className="px-6 py-4">
                      <p className="font-inter-tight text-[13px] text-[#e8e4df]">{o.customer_name}</p>
                      <p className="font-inter-tight text-[11px] text-[#888078]">{o.customer_email}</p>
                    </td>
                    <td className="px-6 py-4 font-inter-tight text-[13px] text-[#888078]">
                      {Array.isArray(o.items) ? o.items.length : 0} item{Array.isArray(o.items) && o.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 font-inter-tight text-[13px] text-[#e8e4df]">{fmt(o.subtotal)}</td>
                    <td className="px-6 py-4"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-6 py-4 font-inter-tight text-[12px] text-[#888078]">{fmtDate(o.created_at)}</td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/orders/${o.id}`} className="font-inter-tight text-[12px] text-[#888078] hover:text-[#c9a96e] transition-colors">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 py-6">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-4 py-2 rounded-[6px] border border-[rgba(255,255,255,0.1)] font-inter-tight text-[12px] text-[#888078] disabled:opacity-30 hover:text-[#e8e4df] cursor-pointer transition-colors"
            >Previous</button>
            <span className="font-inter-tight text-[12px] text-[#888078]">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-[6px] border border-[rgba(255,255,255,0.1)] font-inter-tight text-[12px] text-[#888078] disabled:opacity-30 hover:text-[#e8e4df] cursor-pointer transition-colors"
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
