import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { BookingRequestEmail } from "@/emails/booking-request";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { serviceName, customerName, preferredDate, contactMethod, contactValue } = body;

  if (!serviceName || !customerName || !preferredDate || !contactMethod || !contactValue) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const html = await render(
    BookingRequestEmail({ serviceName, customerName, preferredDate, contactMethod, contactValue })
  );

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: process.env.RESEND_TO_EMAIL!,
    subject: `New Booking Request: ${serviceName} — ${customerName}`,
    html,
  });

  if (error) {
    console.error("[send-booking] ❌ Resend error:", JSON.stringify(error, null, 2));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("[send-booking] ✅ Email sent:", data?.id);
  return NextResponse.json({ success: true });
}
