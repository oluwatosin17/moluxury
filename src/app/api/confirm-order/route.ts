import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { CustomerOrderConfirmationEmail, CustomerOrderItem } from "@/emails/order-confirmation-customer";

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory idempotency guard (per process lifetime).
const sentOrders = new Set<string>();

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[confirm-order] ❌ RESEND_API_KEY not set");
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

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

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const adminEmail = process.env.RESEND_TO_EMAIL || "omosope43@gmail.com";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://moluxury.vercel.app";

  const html = await render(
    CustomerOrderConfirmationEmail({ orderId, customerName, customerEmail, items, total, confirmedAt })
  );

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: customerEmail,
    subject: `Your MoLuxury order is confirmed — ${orderId}`,
    html,
  });

  if (error) {
    console.error("[confirm-order] ❌ Customer email failed:", JSON.stringify(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Admin copy (non-fatal)
  await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `New order received: ${orderId} from ${customerName}`,
    html,
  }).catch(e => console.error("[confirm-order] ⚠️ Admin copy failed:", e));

  sentOrders.add(orderId);

  // Write to Supabase (non-fatal — never break email flow)
  try {
    const { createAdminSupabaseClient } = await import('@/lib/supabase/server');
    const supabase = createAdminSupabaseClient();
    await supabase.from('orders').upsert({
      order_ref: orderId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: body.phone ?? null,
      street_address: body.address ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      zip: body.zip ?? null,
      country: body.country ?? 'Nigeria',
      additional_notes: body.notes ?? null,
      items,
      subtotal: body.subtotal ?? total,
      status: 'pending',
      source: 'website',
    }, { onConflict: 'order_ref', ignoreDuplicates: true });
  } catch (e) {
    console.error('[confirm-order] Supabase write failed (non-fatal):', e);
  }

  return NextResponse.json({ success: true, emailId: data?.id });
}
