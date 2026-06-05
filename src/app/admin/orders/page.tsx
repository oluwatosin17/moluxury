"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminTopbar from "@/components/admin/topbar";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";
import type { Order, OrderStatus } from "@/lib/supabase/types";

const STATUSES: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all",             label: "All" },
  { value: "pending",         label: "Pending" },
  { value: "payment_received",label: "Payment Received" },
  { value: "processing",      label: "Processing" },
  { value: "shipped",         label: "Shipped" },
  { value: "delivered",       label: "Delivered" },
  { value: "cancelled",       label: "Cancelled" },
];

export default function AdminOrders() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState<OrderStatus | "all">("all");
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(0);
  const PER_PAGE = 25;

  useEffect(() => {
    setLoading(true);
    const supabase = createClient();
    let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (status !== "all") q = q.eq("status", status);
    q.then(({ data }) => { setOrders(data ?? []); setLoading(false); });
  }, [status]);

  const filtered = orders.filter(o =>
    !search || o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
    o.order_ref.toLowerCase().includes(search.toLowerCase())
  );
  const pageItems = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  function fmt(n: number) { return `₦${n.toLocaleString("en-NG")}`; }
  function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title="Orders" subtitle={`${filtered.length} orders`} />

      <div className="px-8 py-4 border-b border-[rgba(255,255,255,0.07)] space-y-3">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search by name, email, or ref…"
          className="w-full max-w-sm bg-[#16181d] border border-[rgba(255,255,255,0.07)] rounded-[8px] px-3 py-2 font-inter-tight text-[13px] text-[#e8e4df] placeholder:text-[#888078] outline-none focus:border-[#c9a96e]/40"
        />
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(s => (
            <button key={s.value} onClick={() => { setStatus(s.value); setPage(0); }}
              className={`px-3 py-1.5 rounded-[6px] font-inter-tight text-[12px] transition-colors cursor-pointer ${
                status === s.value ? "bg-[rgba(255,255,255,0.08)] text-[#e8e4df]" : "text-[#888078] hover:text-[#e8e4df]"
              }`}
            >{s.label}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[#0e0f11]">
            <tr className="border-b border-[rgba(255,255,255,0.07)]">
              {["Ref", "Customer", "Items", "Total", "Status", "Date", ""].map(h => (
                <th key={h} className="px-6 py-3 text-left font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-16 text-center"><div className="w-5 h-5 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
            ) : pageItems.map(o => (
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
                  <Link href={`/admin/orders/${o.id}`} className="font-inter-tight text-[12px] text-[#888078] hover:text-[#c9a96e] transition-colors">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
