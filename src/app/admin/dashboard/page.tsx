"use client";
import { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/topbar";
import { OrderStatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";
import type { Order, Booking } from "@/lib/supabase/types";

export default function AdminDashboard() {
  const [stats, setStats]     = useState({ products: 0, orders: 0, bookings: 0, pending: 0 });
  const [orders, setOrders]   = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(({ stats: s, recentOrders: o, recentBookings: b }) => {
        setStats(s);
        setOrders(o);
        setBookings(b);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function fmt(n: number) { return `₦${n.toLocaleString("en-NG")}`; }
  function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  const STATS = [
    { label: "Live Products", value: stats.products, href: "/admin/products",        accent: false },
    { label: "Total Orders",  value: stats.orders,   href: "/admin/orders",          accent: false },
    { label: "Pending Payment", value: stats.pending, href: "/admin/orders?status=pending", accent: stats.pending > 0 },
    { label: "Bookings",      value: stats.bookings, href: "/admin/bookings",        accent: false },
  ];

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title="Dashboard" subtitle={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} />
      <div className="flex-1 px-8 py-6 space-y-8 overflow-y-auto">

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {STATS.map(s => (
            <Link key={s.label} href={s.href}
              className={`bg-[#16181d] border rounded-[12px] p-5 hover:border-[rgba(255,255,255,0.12)] transition-colors group ${
                s.accent ? "border-[#c9a96e]/30" : "border-[rgba(255,255,255,0.07)]"
              }`}
            >
              <p className="font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078] mb-3">{s.label}</p>
              <p className={`font-cormorant italic text-[48px] leading-none tracking-[-2px] ${s.accent ? "text-[#c9a96e]" : "text-[#e8e4df]"}`}>
                {loading ? "—" : s.value}
              </p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Recent orders */}
          <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.07)]">
              <h3 className="font-inter-tight font-medium text-[13px] text-[#e8e4df]">Recent Orders</h3>
              <Link href="/admin/orders" className="font-inter-tight text-[12px] text-[#888078] hover:text-[#c9a96e] transition-colors">View all</Link>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {orders.length === 0 && !loading ? (
                <p className="px-5 py-8 font-inter-tight text-[13px] text-[#888078]">No orders yet</p>
              ) : orders.map(o => (
                <Link key={o.id} href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <div>
                    <p className="font-mono text-[12px] text-[#c9a96e]">{o.order_ref}</p>
                    <p className="font-inter-tight text-[12px] text-[#888078] mt-0.5">{o.customer_name} · {fmtDate(o.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-inter-tight text-[13px] text-[#e8e4df]">{fmt(o.subtotal)}</p>
                    <div className="mt-1"><OrderStatusBadge status={o.status} /></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent bookings */}
          <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.07)]">
              <h3 className="font-inter-tight font-medium text-[13px] text-[#e8e4df]">Recent Bookings</h3>
              <Link href="/admin/bookings" className="font-inter-tight text-[12px] text-[#888078] hover:text-[#c9a96e] transition-colors">View all</Link>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {bookings.length === 0 && !loading ? (
                <p className="px-5 py-8 font-inter-tight text-[13px] text-[#888078]">No bookings yet</p>
              ) : bookings.map(b => (
                <Link key={b.id} href={`/admin/bookings/${b.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <div>
                    <p className="font-inter-tight text-[13px] text-[#e8e4df]">{b.customer_name}</p>
                    <p className="font-inter-tight text-[12px] text-[#888078] mt-0.5">{b.service_name} · {fmtDate(b.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-inter-tight text-[11px] px-2 py-0.5 rounded-full border ${
                      b.status === "new" ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                      : b.status === "confirmed" ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                      : "bg-[rgba(255,255,255,0.05)] text-[#888078] border-[rgba(255,255,255,0.07)]"
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
