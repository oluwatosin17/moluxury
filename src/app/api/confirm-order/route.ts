import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { CustomerOrderConfirmationEmail, CustomerOrderItem } from "@/emails/order-confirmation-customer";

const PLACEHOLDER_KEY = "re_your_api_key_here";
const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory idempotency guard for the process lifetime.
// In production, store sent order IDs in a database instead.
const sentOrders = new Set<string>();

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === PLACEHOLDER_KEY) {
    console.error(
      "[confirm-order] ❌ RESEND_API_KEY is not set.\n" +
      "  → Get your key at https://resend.com/api-keys\n" +
      "  → Add it to .env.local: RESEND_API_KEY=re_...\n" +
      "  → Restart the dev server after updating .env.local"
    );
    return NextResponse.json({ error: "Email service not configured — see server logs" }, { status: 503 });
  }

  const body: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    items: CustomerOrderItem[];
    total: number;
    confirmedAt: string;
  } = await req.json();

  const { orderId, customerName, customerEmail, items, total, confirmedAt } = body;

  if (!orderId || !customerName || !customerEmail || !items?.length || !total) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (sentOrders.has(orderId)) {
    console.log("[confirm-order] Duplicate suppressed for:", orderId);
    return NextResponse.json({ success: true, duplicate: true });
  }

  const html = await render(
    CustomerOrderConfirmationEmail({ orderId, customerName, customerEmail, items, total, confirmedAt })
  );

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: customerEmail,
    subject: `Your MoLuxury order is confirmed — ${orderId}`,
    html,
  });

  if (error) {
    console.error("[confirm-order] ❌ Resend error:", JSON.stringify(error, null, 2));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("[confirm-order] ✅ Email sent:", data?.id, "→", customerEmail);
  sentOrders.add(orderId);
  return NextResponse.json({ success: true, emailId: data?.id });
}
