"use client";
import { useState, useEffect, use } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import type { OrderStatus, OrderItem } from "@/lib/supabase/types";

const STATUS_STEPS: OrderStatus[] = ["pending","payment_received","processing","shipped","delivered"];

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending:          "Your order is received. We're awaiting payment confirmation.",
  payment_received: "Payment confirmed. We're preparing your piece.",
  processing:       "Your wig is being hand-finished. Almost ready.",
  shipped:          "Your piece is on its way.",
  delivered:        "Delivered. We hope you love it.",
  cancelled:        "This order was cancelled. Contact us if you have questions.",
  refunded:         "This order has been refunded. Contact us if you need further help.",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:          "Order Received",
  payment_received: "Payment Confirmed",
  processing:       "Preparing",
  shipped:          "Shipped",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
  refunded:         "Refunded",
};

interface OrderData {
  order_ref: string;
  created_at: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tracking_number?: string;
  customer_name: string;
}

export default function OrderStatusPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const [order, setOrder]   = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/status?ref=${ref}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setOrder(data);
        else setNotFound(true);
        setLoading(false);
      });
  }, [ref]);

  function fmt(n: number) { return `₦${n.toLocaleString("en-NG")}`; }

  const currentStepIdx = order ? STATUS_STEPS.indexOf(order.status) : -1;
  const isCancelled = order?.status === "cancelled" || order?.status === "refunded";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface pt-[88px] pb-20 px-4">
        <div className="max-w-xl mx-auto space-y-8 pt-10">

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {notFound && (
            <div className="text-center py-16 space-y-4">
              <h1 className="font-cormorant italic text-[40px] tracking-[-2px] text-primary">Order not found</h1>
              <p className="font-inter-tight text-[14px] text-secondary">
                We couldn&apos;t find an order with reference <span className="font-medium text-primary">{ref}</span>.
              </p>
              <Link href="/orders" className="inline-block font-inter-tight text-[13px] text-primary underline underline-offset-4">
                Try again
              </Link>
            </div>
          )}

          {order && (
            <>
              {/* Header */}
              <div className="space-y-1">
                <p className="font-inter-tight text-[11px] tracking-[2px] uppercase text-secondary">Order Reference</p>
                <h1 className="font-cormorant italic text-[40px] tracking-[-2px] text-primary leading-none">{order.order_ref}</h1>
                <p className="font-inter-tight text-[13px] text-secondary">
                  {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              {/* Status message */}
              <div className={`rounded-[12px] p-5 ${isCancelled ? "bg-red-50 border border-red-100" : "bg-white border border-black/5"}`}>
                <p className="font-inter-tight text-[14px] text-primary leading-relaxed">
                  {STATUS_MESSAGES[order.status]}
                </p>
                {order.tracking_number && (
                  <p className="font-inter-tight text-[13px] text-secondary mt-2">
                    Tracking: <span className="font-medium text-primary font-mono">{order.tracking_number}</span>
                  </p>
                )}
              </div>

              {/* Progress timeline */}
              {!isCancelled && (
                <div className="bg-white border border-black/5 rounded-[12px] p-5">
                  <div className="flex items-center">
                    {STATUS_STEPS.map((step, i) => {
                      const done = i <= currentStepIdx;
                      const current = i === currentStepIdx;
                      return (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center gap-1.5 shrink-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                              done ? "bg-primary border-primary" : "bg-transparent border-black/15"
                            }`}>
                              {done && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path d="M2.5 6l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                            <p className={`font-inter-tight text-[10px] text-center leading-tight w-14 ${
                              current ? "text-primary font-medium" : done ? "text-secondary" : "text-muted"
                            }`}>
                              {STATUS_LABELS[step]}
                            </p>
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`flex-1 h-[1px] mx-1 mb-5 ${i < currentStepIdx ? "bg-primary" : "bg-black/10"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="bg-white border border-black/5 rounded-[12px] overflow-hidden">
                <div className="px-5 py-4 border-b border-black/5">
                  <p className="font-inter-tight font-medium text-[13px] text-primary">
                    {Array.isArray(order.items) ? order.items.length : 0} item{Array.isArray(order.items) && order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="divide-y divide-black/5">
                  {(Array.isArray(order.items) ? order.items : []).map((item, i) => (
                    <div key={i} className="px-5 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-inter-tight text-[13px] text-primary">{item.name}</p>
                        <p className="font-inter-tight text-[12px] text-secondary mt-0.5">
                          {item.length} · {item.density} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="font-inter-tight text-[13px] text-primary">{item.price}</p>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-black/5 flex justify-between">
                  <p className="font-inter-tight font-medium text-[13px] text-primary">Total</p>
                  <p className="font-inter-tight font-medium text-[13px] text-primary">{fmt(order.subtotal)}</p>
                </div>
              </div>

              {/* Help */}
              <div className="text-center space-y-2">
                <p className="font-inter-tight text-[13px] text-secondary">Need help with your order?</p>
                <a href="https://wa.me/2348144730948" target="_blank" rel="noopener noreferrer"
                  className="inline-block font-inter-tight text-[13px] text-primary underline underline-offset-4"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
