"use client";
import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminTopbar from "@/components/admin/topbar";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";
import type { Order, OrderStatus } from "@/lib/supabase/types";

const STATUS_FLOW: OrderStatus[] = ["pending","payment_received","processing","shipped","delivered"];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder]     = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [notes, setNotes]     = useState("");
  const [tracking, setTracking] = useState("");
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");

  const supabase = createClient();

  useEffect(() => {
    supabase.from("orders").select("*").eq("id", id).single().then(({ data }) => {
      if (data) { setOrder(data); setNewStatus(data.status); setNotes(data.admin_notes ?? ""); setTracking(data.tracking_number ?? ""); }
      setLoading(false);
    });
  }, [id]); // eslint-disable-line

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function updateStatus() {
    if (!order) return;
    setSaving(true);
    const update: Partial<Order> = { status: newStatus };
    if (newStatus === "shipped" && tracking) update.tracking_number = tracking;
    const { error } = await supabase.from("orders").update(update).eq("id", id);
    if (!error) { setOrder(o => o ? { ...o, ...update } : o); showToast("Status updated"); }
    setSaving(false);
  }

  async function saveNotes() {
    await supabase.from("orders").update({ admin_notes: notes }).eq("id", id);
    showToast("Notes saved");
  }

  async function confirmPayment() {
    const update = { status: "payment_received" as OrderStatus, payment_confirmed_at: new Date().toISOString() };
    await supabase.from("orders").update(update).eq("id", id);
    setOrder(o => o ? { ...o, ...update } : o);
    setNewStatus("payment_received");
    showToast("Payment confirmed");
  }

  function fmt(n: number) { return `₦${n.toLocaleString("en-NG")}`; }
  function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  if (loading) return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!order) return <div className="flex flex-col flex-1 items-center justify-center"><p className="font-inter-tight text-[#888078]">Order not found</p></div>;

  return (
    <div className="flex flex-col flex-1">
      {toast && <div className="fixed top-4 right-4 z-50 bg-green-500/90 text-white font-inter-tight text-[13px] px-5 py-3 rounded-[10px]">{toast}</div>}
      <AdminTopbar
        title={order.order_ref}
        subtitle={fmtDate(order.created_at)}
        actions={<Link href="/admin/orders" className="font-inter-tight text-[13px] text-[#888078] hover:text-[#e8e4df] transition-colors">← Back</Link>}
      />

      <div className="flex-1 flex gap-6 px-8 py-6 overflow-y-auto">
        {/* Left — order info */}
        <div className="flex-1 space-y-6">
          {/* Customer */}
          <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 space-y-3">
            <h3 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">Customer</h3>
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              {[
                { label: "Name",    value: order.customer_name },
                { label: "Email",   value: order.customer_email },
                { label: "Phone",   value: order.customer_phone ?? "—" },
                { label: "Country", value: order.country },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="font-inter-tight text-[11px] text-[#888078] mb-0.5">{label}</p>
                  <p className="font-inter-tight text-[#e8e4df]">{value}</p>
                </div>
              ))}
              {order.street_address && (
                <div className="col-span-2">
                  <p className="font-inter-tight text-[11px] text-[#888078] mb-0.5">Address</p>
                  <p className="font-inter-tight text-[#e8e4df]">
                    {order.street_address}{order.city ? `, ${order.city}` : ""}{order.state ? `, ${order.state}` : ""}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.07)]">
              <h3 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">Items</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.07)]">
                  {["Product", "Length", "Density", "Qty", "Price", "Subtotal"].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-inter-tight text-[11px] text-[#888078]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(order.items) ? order.items : []).map((item, i) => (
                  <tr key={i} className="border-b border-[rgba(255,255,255,0.04)] last:border-0">
                    <td className="px-5 py-3 font-inter-tight text-[13px] text-[#e8e4df]">{item.name}</td>
                    <td className="px-5 py-3 font-inter-tight text-[12px] text-[#888078]">{item.length}</td>
                    <td className="px-5 py-3 font-inter-tight text-[12px] text-[#888078]">{item.density}</td>
                    <td className="px-5 py-3 font-inter-tight text-[13px] text-[#e8e4df]">{item.quantity}</td>
                    <td className="px-5 py-3 font-inter-tight text-[13px] text-[#e8e4df]">{item.price}</td>
                    <td className="px-5 py-3 font-inter-tight text-[13px] text-[#c9a96e]">{fmt(item.priceNum * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.07)] flex justify-end">
              <div className="font-inter-tight text-[14px] text-[#e8e4df]">
                Total: <span className="text-[#c9a96e] font-medium ml-2">{fmt(order.subtotal)}</span>
              </div>
            </div>
          </div>

          {/* Admin notes */}
          <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 space-y-3">
            <h3 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">Admin Notes</h3>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={saveNotes}
              rows={3} placeholder="Internal notes (not visible to customer)"
              className="w-full bg-[#0e0f11] border border-[rgba(255,255,255,0.07)] focus:border-[#c9a96e]/40 rounded-[8px] px-3 py-2.5 font-inter-tight text-[13px] text-[#e8e4df] placeholder:text-[#888078] outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-72 space-y-4 shrink-0">
          {/* Status */}
          <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 space-y-4">
            <h3 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">Status</h3>
            <div><OrderStatusBadge status={order.status} /></div>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value as OrderStatus)}
              className="w-full bg-[#0e0f11] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-3 py-2.5 font-inter-tight text-[13px] text-[#e8e4df] outline-none cursor-pointer"
            >
              {STATUS_FLOW.map(s => <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            {newStatus === "shipped" && (
              <input value={tracking} onChange={e => setTracking(e.target.value)}
                placeholder="Tracking number"
                className="w-full bg-[#0e0f11] border border-[rgba(255,255,255,0.07)] rounded-[8px] px-3 py-2.5 font-inter-tight text-[13px] text-[#e8e4df] placeholder:text-[#888078] outline-none"
              />
            )}
            <button onClick={updateStatus} disabled={saving || newStatus === order.status}
              className="w-full bg-[#c9a96e] hover:bg-[#d4b87a] disabled:opacity-40 text-[#0e0f11] font-inter-tight font-medium text-[13px] py-2.5 rounded-[8px] transition-colors cursor-pointer"
            >
              {saving ? "Updating…" : "Update Status"}
            </button>
          </div>

          {/* Payment */}
          <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 space-y-3">
            <h3 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">Payment</h3>
            {order.payment_confirmed_at ? (
              <p className="font-inter-tight text-[12px] text-green-400">
                ✓ Confirmed {fmtDate(order.payment_confirmed_at)}
              </p>
            ) : (
              <>
                <p className="font-inter-tight text-[12px] text-[#888078]">Not yet confirmed</p>
                <button onClick={confirmPayment}
                  className="w-full bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 font-inter-tight text-[13px] py-2.5 rounded-[8px] transition-colors cursor-pointer"
                >
                  Mark Payment Confirmed
                </button>
              </>
            )}
            {order.customer_phone && (
              <a href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}?text=Hi ${encodeURIComponent(order.customer_name)}, regarding your MoLuxury order ${order.order_ref}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] text-[#888078] hover:text-[#e8e4df] font-inter-tight text-[13px] py-2.5 rounded-[8px] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.167a5.833 5.833 0 100 11.666A5.833 5.833 0 007 1.167zM9.625 5.25l-3.5 3.5L4.375 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                WhatsApp customer
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
