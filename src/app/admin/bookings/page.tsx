"use client";
import { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/topbar";
import { BookingStatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";
import type { Booking, BookingStatus } from "@/lib/supabase/types";

const STATUSES: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all",       label: "All" },
  { value: "new",       label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [status, setStatus]     = useState<BookingStatus | "all">("all");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/bookings")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          setError(data.error ?? "Failed to load bookings");
        }
        setLoading(false);
      })
      .catch(() => { setError("Network error"); setLoading(false); });
  }, []);

  const filtered = bookings.filter(b => {
    if (status !== "all" && b.status !== status) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.customer_name.toLowerCase().includes(q) ||
      b.service_name.toLowerCase().includes(q) ||
      b.booking_ref.toLowerCase().includes(q)
    );
  });

  function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title="Bookings" subtitle={loading ? "Loading…" : `${filtered.length} bookings`} />

      <div className="px-8 py-4 border-b border-[rgba(255,255,255,0.07)] space-y-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, service, or ref…"
          className="w-full max-w-sm bg-[#16181d] border border-[rgba(255,255,255,0.07)] rounded-[8px] px-3 py-2 font-inter-tight text-[13px] text-[#e8e4df] placeholder:text-[#888078] outline-none focus:border-[#c9a96e]/40"
        />
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-3 py-1.5 rounded-[6px] font-inter-tight text-[12px] transition-colors cursor-pointer ${
                status === s.value ? "bg-[rgba(255,255,255,0.08)] text-[#e8e4df]" : "text-[#888078] hover:text-[#e8e4df]"
              }`}
            >{s.label}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error ? (
          <p className="px-8 py-10 font-inter-tight text-[13px] text-red-400">{error}</p>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-[#0e0f11]">
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                {["Ref", "Customer", "Service", "Contact", "Preferred Date", "Status", "Received", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="w-5 h-5 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center font-inter-tight text-[13px] text-[#888078]">
                    {search || status !== "all" ? "No bookings match your filter" : "No bookings yet"}
                  </td>
                </tr>
              ) : filtered.map(b => (
                <tr key={b.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                  <td className="px-5 py-4 font-mono text-[12px] text-[#c9a96e]">{b.booking_ref}</td>
                  <td className="px-5 py-4 font-inter-tight text-[13px] text-[#e8e4df]">{b.customer_name}</td>
                  <td className="px-5 py-4 font-inter-tight text-[13px] text-[#888078]">{b.service_name}</td>
                  <td className="px-5 py-4">
                    {b.contact_method === "whatsapp" ? (
                      <a
                        href={`https://wa.me/${(b.customer_phone ?? "").replace(/\D/g, "")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="font-inter-tight text-[12px] text-green-400 hover:underline"
                      >WA: {b.customer_phone}</a>
                    ) : (
                      <span className="font-inter-tight text-[12px] text-[#888078]">{b.customer_email}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-inter-tight text-[12px] text-[#888078]">
                    {b.preferred_date
                      ? new Date(b.preferred_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                      : "—"}
                  </td>
                  <td className="px-5 py-4"><BookingStatusBadge status={b.status} /></td>
                  <td className="px-5 py-4 font-inter-tight text-[12px] text-[#888078]">{fmtDate(b.created_at)}</td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/bookings/${b.id}`} className="font-inter-tight text-[12px] text-[#888078] hover:text-[#c9a96e] transition-colors">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
