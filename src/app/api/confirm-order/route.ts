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
    items: CustomerOrderItem[];
    total: number;
    confirmedAt: string;
  } = await req.json();

  const { orderId, customerName, customerEmail, items, total, confirmedAt } = body;

  if (!orderId || !customerName || !customerEmail || !items?.length || !total) {
    console.error("[confirm-order] ❌ Missing required fields:", { orderId, customerName, customerEmail, itemCount: items?.length, total });
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (sentOrders.has(orderId)) {
    console.log("[confirm-order] Duplicate suppressed:", orderId);
    return NextResponse.json({ success: true, duplicate: true });
  }

  // Use sandbox address if no custom from is set — avoids unverified-domain errors
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const adminEmail = process.env.RESEND_TO_EMAIL || "omosope43@gmail.com";

  console.log("[confirm-order] Sending to:", customerEmail, "| from:", fromEmail, "| admin cc:", adminEmail);

  const html = await render(
    CustomerOrderConfirmationEmail({ orderId, customerName, customerEmail, items, total, confirmedAt })
  );

  // Send customer copy
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

  console.log("[confirm-order] ✅ Customer email sent:", data?.id, "→", customerEmail);

  // Send admin notification copy
  const adminResult = await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `New order received: ${orderId} from ${customerName}`,
    html,
  });

  if (adminResult.error) {
    // Non-fatal — log but don't fail the response
    console.error("[confirm-order] ⚠️ Admin copy failed:", JSON.stringify(adminResult.error));
  } else {
    console.log("[confirm-order] ✅ Admin copy sent:", adminResult.data?.id, "→", adminEmail);
  }

  sentOrders.add(orderId);
  return NextResponse.json({ success: true, emailId: data?.id });
}
