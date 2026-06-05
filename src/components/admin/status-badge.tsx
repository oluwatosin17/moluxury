import type { OrderStatus, BookingStatus } from "@/lib/supabase/types";

const ORDER_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending:          { label: "Pending",          color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  payment_received: { label: "Payment Received", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  processing:       { label: "Processing",       color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  shipped:          { label: "Shipped",          color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" },
  delivered:        { label: "Delivered",        color: "bg-green-500/15 text-green-400 border-green-500/30" },
  cancelled:        { label: "Cancelled",        color: "bg-red-500/15 text-red-400 border-red-500/30" },
  refunded:         { label: "Refunded",         color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
};

const BOOKING_CONFIG: Record<BookingStatus, { label: string; color: string }> = {
  new:       { label: "New",       color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  contacted: { label: "Contacted", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  confirmed: { label: "Confirmed", color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  completed: { label: "Completed", color: "bg-green-500/15 text-green-400 border-green-500/30" },
  no_show:   { label: "No Show",   color: "bg-red-500/15 text-red-400 border-red-500/30" },
  cancelled: { label: "Cancelled", color: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = ORDER_CONFIG[status] ?? ORDER_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-inter-tight text-[11px] border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const cfg = BOOKING_CONFIG[status] ?? BOOKING_CONFIG.new;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-inter-tight text-[11px] border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}
