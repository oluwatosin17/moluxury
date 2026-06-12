"use client";
import { useState, useEffect } from "react";
import AdminTopbar from "@/components/admin/topbar";
import { BookingStatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";
import type { Booking, BookingStatus } from "@/lib/supabase/types";

const BOOKING_STATUSES: BookingStatus[] = ["new", "contacted", "confirmed", "completed", "no_show", "cancelled"];

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<BookingStatus>("new");
  const [notes, setNotes]     = useState("");
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState("");

  useEffect(() => {
    fetch(`/api/admin/bookings/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          setBooking(data);
          setNewStatus(data.status);
          setNotes(data.admin_notes ?? "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function patch(body: Partial<Booking>) {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) setBooking(data);
    return res.ok;
  }

  async function updateStatus() {
    setSaving(true);
    const ok = await patch({ status: newStatus });
    if (ok) showToast("Status updated");
    setSaving(false);
  }

  async function saveNotes() {
    await patch({ admin_notes: notes });
    showToast("Notes saved");
  }

  function fmtDate(s: string) {
    return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  if (loading) return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!booking) return (
    <div className="flex flex-col flex-1 items-center justify-center gap-3">
      <p className="font-inter-tight text-[#888078]">Booking not found</p>
      <Link href="/admin/bookings" className="font-inter-tight text-[13px] text-[#c9a96e] hover:underline">← Back to bookings</Link>
    </div>
  );

  const whatsappMsg = `Hi ${booking.customer_name}, your ${booking.service_name} appointment${
    booking.preferred_date
      ? ` on ${new Date(booking.preferred_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}`
      : ""
  } is confirmed. See you at our studio.`;

  return (
    <div className="flex flex-col flex-1">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500/90 text-white font-inter-tight text-[13px] px-5 py-3 rounded-[10px]">
          {toast}
        </div>
      )}

      <AdminTopbar
        title={booking.booking_ref}
        subtitle={fmtDate(booking.created_at)}
        actions={
          <Link href="/admin/bookings" className="font-inter-tight text-[13px] text-[#888078] hover:text-[#e8e4df] transition-colors">
            ← Back
          </Link>
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 px-4 sm:px-8 py-4 sm:py-6 overflow-y-auto">
        {/* Left */}
        <div className="flex-1 space-y-4 sm:space-y-5 min-w-0">

          <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 space-y-4">
            <h3 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">Booking Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[13px]">
              {[
                { label: "Customer",       value: booking.customer_name },
                { label: "Service",        value: booking.service_name },
                { label: "Preferred Date", value: booking.preferred_date ? new Date(booking.preferred_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Not specified" },
                { label: "Contact Method", value: booking.contact_method === "whatsapp" ? "WhatsApp" : "Email" },
                {
                  label: booking.contact_method === "whatsapp" ? "Phone" : "Email",
                  value: booking.customer_phone ?? booking.customer_email ?? "—",
                },
                { label: "Source", value: booking.source },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="font-inter-tight text-[11px] text-[#888078] mb-0.5">{label}</p>
                  <p className="font-inter-tight text-[#e8e4df]">{value}</p>
                </div>
              ))}
              {booking.service_price_from && (
                <div>
                  <p className="font-inter-tight text-[11px] text-[#888078] mb-0.5">Price from</p>
                  <p className="font-inter-tight text-[#c9a96e]">₦{booking.service_price_from.toLocaleString("en-NG")}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 space-y-3">
            <h3 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">Admin Notes</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={saveNotes}
              rows={3}
              placeholder="Internal notes"
              className="w-full bg-[#0e0f11] border border-[rgba(255,255,255,0.07)] focus:border-[#c9a96e]/40 rounded-[8px] px-3 py-2.5 font-inter-tight text-[13px] text-[#e8e4df] placeholder:text-[#888078] outline-none transition-colors resize-none"
            />
          </div>
        </div>

        {/* Right sidebar — full width on mobile */}
        <div className="w-full lg:w-72 space-y-4 shrink-0">

          <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 space-y-4">
            <h3 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">Status</h3>
            <div><BookingStatusBadge status={booking.status} /></div>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as BookingStatus)}
              className="w-full bg-[#0e0f11] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-3 py-2.5 font-inter-tight text-[13px] text-[#e8e4df] outline-none cursor-pointer"
            >
              {BOOKING_STATUSES.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
            <button
              onClick={updateStatus}
              disabled={saving || newStatus === booking.status}
              className="w-full bg-[#c9a96e] hover:bg-[#d4b87a] disabled:opacity-40 text-[#0e0f11] font-inter-tight font-medium text-[13px] py-2.5 rounded-[8px] transition-colors cursor-pointer"
            >
              {saving ? "Updating…" : "Update Status"}
            </button>
          </div>

          {(booking.customer_phone || booking.customer_email) && (
            <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 space-y-3">
              <h3 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">Contact</h3>
              {booking.customer_phone && (
                <a
                  href={`https://wa.me/${booking.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMsg)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-inter-tight text-[13px] py-2.5 rounded-[8px] justify-center transition-colors"
                >
                  WhatsApp Confirmation
                </a>
              )}
              {booking.customer_email && (
                <a
                  href={`mailto:${booking.customer_email}`}
                  className="flex items-center gap-2 w-full border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] text-[#888078] hover:text-[#e8e4df] font-inter-tight text-[13px] py-2.5 rounded-[8px] justify-center transition-colors"
                >
                  Send email
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
