import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { OrderConfirmationEmail, OrderItem } from "@/emails/order-confirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const orderJson = formData.get("order") as string | null;
  if (!orderJson) {
    return NextResponse.json({ error: "Missing order data" }, { status: 400 });
  }

  const order: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    items: OrderItem[];
    total: number;
    notes?: string;
  } = JSON.parse(orderJson);

  if (!order.customerName || !order.customerEmail || !order.items?.length) {
    return NextResponse.json({ error: "Incomplete order data" }, { status: 400 });
  }

  // Handle optional proof-of-payment attachment
  const file = formData.get("file") as File | null;
  const attachments: { filename: string; content: string }[] = [];
  if (file && file.size > 0) {
    const buffer = await file.arrayBuffer();
    attachments.push({
      filename: file.name,
      content: Buffer.from(buffer).toString("base64"),
    });
  }

  function fmt(n: number) {
    return `₦${n.toLocaleString("en-NG")}`;
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.RESEND_TO_EMAIL!,
    subject: `New Order: ${order.customerName} — ${fmt(order.total)}`,
    react: OrderConfirmationEmail(order),
    ...(attachments.length > 0 && { attachments }),
  });

  if (error) {
    console.error("[send-order] Resend error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("[send-order] Email sent:", data?.id);
  return NextResponse.json({ success: true });
}
