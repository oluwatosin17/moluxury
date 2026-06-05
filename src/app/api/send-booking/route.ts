import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { BookingRequestEmail } from "@/emails/booking-request";
import { BookingConfirmationCustomerEmail } from "@/emails/booking-confirmation-customer";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { serviceName, customerName, preferredDate, contactMethod, contactValue } = body;

  if (!serviceName || !customerName || !preferredDate || !contactMethod || !contactValue) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Resolve phone/email regardless of which contact method was chosen
  const customerPhone = contactMethod === "whatsapp" ? contactValue : (body.phone ?? null);
  const customerEmail = contactMethod === "email"    ? contactValue : (body.customerEmail ?? null);

  // ── 1. Write to Supabase FIRST — always, regardless of email outcome ─────
  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("bookings").insert({
      booking_ref:       `BK-${Date.now().toString(36).toUpperCase()}`,
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
    });
  } catch (e) {
    console.error("[send-booking] ❌ Supabase write failed:", e);
  }

  // ── 2. Emails (non-fatal — booking is already saved) ─────────────────────
  if (process.env.RESEND_API_KEY) {
    const from    = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const adminTo = process.env.RESEND_TO_EMAIL   || "omosope43@gmail.com";

    // Admin notification
    try {
      const adminHtml = await render(
        BookingRequestEmail({ serviceName, customerName, preferredDate, contactMethod, contactValue })
      );
      await resend.emails.send({
        from,
        to: adminTo,
        subject: `New Booking: ${serviceName} — ${customerName}`,
        html: adminHtml,
      }).catch(e => console.warn("[send-booking] Admin email failed:", e.message));
    } catch (e) {
      console.warn("[send-booking] Admin email render failed:", e);
    }

    // Customer confirmation (only when they provided an email address)
    if (customerEmail) {
      try {
        const customerHtml = await render(
          BookingConfirmationCustomerEmail({
            serviceName, customerName, preferredDate, contactMethod, contactValue,
          })
        );
        await resend.emails.send({
          from,
          to: customerEmail,
          subject: `Your ${serviceName} booking is received — MoLuxury`,
          html: customerHtml,
        }).catch(e => console.warn("[send-booking] Customer email failed (sandbox restriction?):", e.message));
      } catch (e) {
        console.warn("[send-booking] Customer email render failed:", e);
      }
    }
  }

  return NextResponse.json({ success: true });
}
