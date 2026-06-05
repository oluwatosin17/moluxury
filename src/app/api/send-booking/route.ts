import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { BookingRequestEmail } from "@/emails/booking-request";
import { BookingConfirmationCustomerEmail } from "@/emails/booking-confirmation-customer";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Attempt to send an email. Returns true if delivered, false + reason if failed.
 * Never throws — all failures are logged and returned as structured data.
 */
async function sendEmail(params: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await resend.emails.send(params);
    if (error) {
      console.error(`[send-booking] ❌ Email to ${params.to} failed:`, JSON.stringify(error));
      return { ok: false, error: error.message };
    }
    console.log(`[send-booking] ✅ Email to ${params.to} delivered. ID: ${data?.id}`);
    return { ok: true, id: data?.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[send-booking] ❌ Email to ${params.to} threw:`, msg);
    return { ok: false, error: msg };
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { serviceName, customerName, preferredDate, contactMethod, contactValue } = body;

  if (!serviceName || !customerName || !preferredDate || !contactMethod || !contactValue) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const customerPhone = contactMethod === "whatsapp" ? contactValue : (body.phone ?? null);
  const customerEmail = contactMethod === "email"    ? contactValue : (body.customerEmail ?? null);

  // ── 1. Write to Supabase FIRST — always ─────────────────────────────────
  let bookingRef = `BK-${Date.now().toString(36).toUpperCase()}`;
  try {
    const supabase = createAdminSupabaseClient();
    const { data: inserted } = await supabase.from("bookings").insert({
      booking_ref:       bookingRef,
      customer_name:     customerName,
      customer_email:    customerEmail,
      customer_phone:    customerPhone,
      contact_method:    contactMethod,
      service_slug:      (body.serviceSlug as string) ?? serviceName.toLowerCase().replace(/\s+/g, "-"),
      service_name:      serviceName,
      service_price_from:(body.servicePriceFrom as number) ?? null,
      preferred_date:    preferredDate || null,
      status:            "new",
      source:            "website",
    }).select("booking_ref").single();
    if (inserted?.booking_ref) bookingRef = inserted.booking_ref;
    console.log(`[send-booking] ✅ Booking saved: ${bookingRef}`);
  } catch (e) {
    console.error("[send-booking] ❌ Supabase write failed:", e);
  }

  // ── 2. Emails ─────────────────────────────────────────────────────────────
  if (!process.env.RESEND_API_KEY) {
    console.warn("[send-booking] RESEND_API_KEY not set — skipping emails");
    return NextResponse.json({ success: true, bookingRef, emailsSent: false });
  }

  const from    = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const adminTo = process.env.RESEND_TO_EMAIL   || "omosope43@gmail.com";

  // Render templates
  const adminHtml    = await render(
    BookingRequestEmail({ serviceName, customerName, preferredDate, contactMethod, contactValue })
  );
  const customerHtml = await render(
    BookingConfirmationCustomerEmail({ serviceName, customerName, preferredDate, contactMethod, contactValue })
  );

  // ── 2a. Admin notification ────────────────────────────────────────────────
  const adminResult = await sendEmail({
    from,
    to: adminTo,
    subject: `New Booking: ${serviceName} — ${customerName} (${bookingRef})`,
    html: adminHtml,
  });

  // ── 2b. Customer confirmation ─────────────────────────────────────────────
  let customerResult: { ok: boolean; id?: string; error?: string } = { ok: false, error: "No customer email" };

  if (customerEmail) {
    customerResult = await sendEmail({
      from,
      to: customerEmail,
      subject: `Your ${serviceName} booking is received — MoLuxury`,
      html: customerHtml,
    });

    // ── 2c. Fallback: if customer email blocked by sandbox, send to admin ──
    // This ensures admin can manually reach out to the customer even before
    // the sending domain (mail.moluxury.com) is verified in Resend.
    if (!customerResult.ok) {
      console.warn(`[send-booking] Customer email blocked (sandbox). Sending fallback to admin.`);
      await sendEmail({
        from,
        to: adminTo,
        subject: `⚠️ PLEASE FORWARD TO CUSTOMER: ${customerEmail} — ${serviceName} confirmation for ${customerName}`,
        html: `
          <div style="background:#fff3cd;border:1px solid #ffc107;padding:16px;margin-bottom:24px;border-radius:4px;font-family:sans-serif">
            <strong>Action required:</strong> The customer confirmation below could not be delivered directly
            to <strong>${customerEmail}</strong> because the sending domain is not yet verified.
            Please forward this email manually or reply to the customer at that address.
          </div>
          ${customerHtml}
        `,
      });
    }
  }

  const emailStatus = {
    admin:    adminResult.ok ? "delivered" : `failed: ${adminResult.error}`,
    customer: customerResult.ok ? "delivered" : `fallback sent to admin: ${customerResult.error}`,
  };

  console.log("[send-booking] Email status:", JSON.stringify(emailStatus));
  return NextResponse.json({ success: true, bookingRef, emailStatus });
}
