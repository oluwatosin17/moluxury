import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { CustomerOrderConfirmationEmail, CustomerOrderItem } from "@/emails/order-confirmation-customer";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory idempotency guard (per process lifetime).
const sentOrders = new Set<string>();

export async function POST(req: NextRequest) {
  const body: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    notes?: string;
    items: CustomerOrderItem[];
    total: number;
    subtotal?: number;
    confirmedAt: string;
  } = await req.json();

  const { orderId, customerName, customerEmail, items, total, confirmedAt } = body;

  if (!orderId || !customerName || !customerEmail || !items?.length || !total) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (sentOrders.has(orderId)) {
    return NextResponse.json({ success: true, duplicate: true });
  }

  // ── 1. Write to Supabase FIRST — always happens regardless of email outcome ──
  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("orders").upsert({
      order_ref: orderId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: body.phone ?? null,
      street_address: body.address ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      zip: body.zip ?? null,
      country: body.country ?? "Nigeria",
      additional_notes: body.notes ?? null,
      items,
      subtotal: body.subtotal ?? total,
      status: "pending",
      source: "website",
    }, { onConflict: "order_ref", ignoreDuplicates: true });
    sentOrders.add(orderId);
  } catch (e) {
    console.error("[confirm-order] ❌ Supabase write failed:", e);
    // Still continue — attempt emails even if DB write fails
  }

  // ── 2. Send emails (non-fatal — DB record already saved) ──
  if (process.env.RESEND_API_KEY) {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const adminEmail = process.env.RESEND_TO_EMAIL || "omosope43@gmail.com";

    try {
      const html = await render(
        CustomerOrderConfirmationEmail({ orderId, customerName, customerEmail, items, total, confirmedAt })
      );
      // Customer confirmation
      await resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        subject: `Your MoLuxury order is confirmed — ${orderId}`,
        html,
      }).catch(e => console.warn("[confirm-order] Customer email failed (non-fatal):", e.message));

      // Admin notification
      await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: `New order: ${orderId} — ${customerName} — ₦${total.toLocaleString("en-NG")}`,
        html,
      }).catch(e => console.warn("[confirm-order] Admin email failed (non-fatal):", e.message));
    } catch (e) {
      console.warn("[confirm-order] Email render failed (non-fatal):", e);
    }
  }

  return NextResponse.json({ success: true });
}
