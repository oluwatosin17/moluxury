import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Link,
} from "@react-email/components";

export interface CustomerOrderItem {
  name: string;
  length: string;
  density: string;
  quantity: number;
  priceNum: number;
}

export interface CustomerOrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: CustomerOrderItem[];
  total: number;
  confirmedAt: string; // ISO string
}

const base: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

function fmt(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CustomerOrderConfirmationEmail({
  orderId,
  customerName,
  items,
  total,
  confirmedAt,
}: CustomerOrderConfirmationEmailProps) {
  const firstName = customerName.split(" ")[0] || customerName;

  return (
    <Html>
      <Head />
      <Preview>Your MoLuxury order has been received — {orderId}</Preview>
      <Body style={{ ...base, backgroundColor: "#f5f3ef", margin: 0, padding: "48px 0" }}>
        <Container style={{ maxWidth: "580px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "4px", overflow: "hidden" }}>

          {/* Header */}
          <Section style={{ backgroundColor: "#181b25", padding: "40px 48px 32px" }}>
            <Text style={{ ...base, fontSize: "28px", fontStyle: "italic", letterSpacing: "-1.5px", color: "#ffffff", margin: 0, lineHeight: "1" }}>
              MoLuxury
            </Text>
            <Text style={{ ...base, fontSize: "11px", letterSpacing: "2.4px", color: "rgba(255,255,255,0.4)", margin: "8px 0 0", textTransform: "uppercase" }}>
              Service Studio
            </Text>
          </Section>

          {/* Hero message */}
          <Section style={{ padding: "48px 48px 0" }}>
            <Text style={{ ...base, fontSize: "11px", letterSpacing: "2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 14px" }}>
              Order Received
            </Text>
            <Text style={{ ...base, fontSize: "32px", letterSpacing: "-1.2px", color: "#181b25", margin: "0 0 6px", lineHeight: "1.15" }}>
              Thank you, {firstName}.
            </Text>
            <Text style={{ ...base, fontSize: "15px", color: "#666052", margin: "0 0 28px", lineHeight: "1.65", fontWeight: "300" }}>
              We&apos;ve received your order and reserved it for you. Once we confirm your bank transfer, we&apos;ll begin preparing your pieces right away.
            </Text>

            {/* Order ID badge */}
            <Section style={{ backgroundColor: "#f9f8f5", borderRadius: "4px", padding: "14px 20px", display: "inline-block", marginBottom: "40px" }}>
              <Row>
                <Column style={{ width: "50%" }}>
                  <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 4px" }}>
                    Order Reference
                  </Text>
                  <Text style={{ ...base, fontSize: "15px", color: "#181b25", margin: 0, fontWeight: "600", letterSpacing: "0.5px" }}>
                    {orderId}
                  </Text>
                </Column>
                <Column style={{ width: "50%", textAlign: "right" }}>
                  <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 4px" }}>
                    Date
                  </Text>
                  <Text style={{ ...base, fontSize: "13px", color: "#666052", margin: 0, fontWeight: "300" }}>
                    {formatDate(confirmedAt)}
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          <Hr style={{ borderColor: "#f0ece6", margin: "0 48px 32px" }} />

          {/* Order items */}
          <Section style={{ padding: "0 48px" }}>
            <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 16px" }}>
              Your Items
            </Text>

            {items.map((item, i) => (
              <Section key={i} style={{ backgroundColor: "#f9f8f5", borderRadius: "4px", padding: "16px 20px", marginBottom: "4px" }}>
                <Row>
                  <Column style={{ width: "65%" }}>
                    <Text style={{ ...base, fontSize: "14px", color: "#181b25", margin: "0 0 4px", fontWeight: "500", lineHeight: "1.3" }}>
                      {item.name}
                    </Text>
                    <Text style={{ ...base, fontSize: "11px", color: "#afa79c", margin: 0 }}>
                      {item.length} · {item.density} · Qty {item.quantity}
                    </Text>
                  </Column>
                  <Column style={{ width: "35%", textAlign: "right" }}>
                    <Text style={{ ...base, fontSize: "15px", color: "#181b25", margin: 0, fontWeight: "500" }}>
                      {fmt(item.priceNum * item.quantity)}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))}

            {/* Totals */}
            <Section style={{ padding: "16px 20px 0", marginBottom: "8px" }}>
              <Row>
                <Column style={{ width: "50%" }}>
                  <Text style={{ ...base, fontSize: "13px", color: "#afa79c", margin: "0 0 6px", fontWeight: "300" }}>
                    Shipping
                  </Text>
                </Column>
                <Column style={{ width: "50%", textAlign: "right" }}>
                  <Text style={{ ...base, fontSize: "13px", color: "#666052", margin: "0 0 6px" }}>
                    Free
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Total row */}
            <Section style={{ backgroundColor: "#181b25", borderRadius: "4px", padding: "16px 20px", marginBottom: "40px" }}>
              <Row>
                <Column style={{ width: "60%" }}>
                  <Text style={{ ...base, fontSize: "11px", letterSpacing: "1.2px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", margin: 0 }}>
                    Total Paid
                  </Text>
                </Column>
                <Column style={{ width: "40%", textAlign: "right" }}>
                  <Text style={{ ...base, fontSize: "20px", color: "#ffffff", margin: 0, fontWeight: "600", letterSpacing: "-0.5px" }}>
                    {fmt(total)}
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          <Hr style={{ borderColor: "#f0ece6", margin: "0 48px 36px" }} />

          {/* Payment status */}
          <Section style={{ padding: "0 48px 36px" }}>
            <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 14px" }}>
              Payment Status
            </Text>
            <Section style={{ backgroundColor: "#f0faf4", border: "1px solid #c3e6d0", borderRadius: "4px", padding: "14px 20px" }}>
              <Row>
                <Column style={{ width: "20px" }}>
                  <Text style={{ ...base, fontSize: "16px", margin: 0 }}>✓</Text>
                </Column>
                <Column>
                  <Text style={{ ...base, fontSize: "14px", color: "#0f6b2f", margin: 0, fontWeight: "500" }}>
                    Payment submitted — awaiting confirmation
                  </Text>
                  <Text style={{ ...base, fontSize: "12px", color: "#52946b", margin: "4px 0 0", fontWeight: "300" }}>
                    We typically verify transfers within 1–2 hours during business hours.
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          <Hr style={{ borderColor: "#f0ece6", margin: "0 48px 36px" }} />

          {/* What happens next */}
          <Section style={{ padding: "0 48px 40px" }}>
            <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 20px" }}>
              What Happens Next
            </Text>

            {[
              {
                step: "01",
                title: "Payment Verified",
                body: "Our finance team reviews and confirms your bank transfer. You'll be notified once this is complete.",
                timeline: "Within 1–2 hours",
              },
              {
                step: "02",
                title: "Order Prepared",
                body: "Once payment is confirmed, your pieces are carefully prepared, quality checked, and packaged.",
                timeline: "1–3 business days",
              },
              {
                step: "03",
                title: "Dispatched",
                body: "Your order is dispatched and you'll receive a notification with tracking details.",
                timeline: "As scheduled",
              },
            ].map(({ step, title, body, timeline }) => (
              <Section key={step} style={{ marginBottom: "20px" }}>
                <Row>
                  <Column style={{ width: "40px", verticalAlign: "top" }}>
                    <Text style={{ ...base, fontSize: "11px", letterSpacing: "1px", color: "#d4cdc5", fontWeight: "600", margin: "2px 0 0" }}>
                      {step}
                    </Text>
                  </Column>
                  <Column>
                    <Text style={{ ...base, fontSize: "14px", color: "#181b25", margin: "0 0 4px", fontWeight: "500" }}>
                      {title}
                    </Text>
                    <Text style={{ ...base, fontSize: "13px", color: "#666052", margin: "0 0 4px", lineHeight: "1.6", fontWeight: "300" }}>
                      {body}
                    </Text>
                    <Text style={{ ...base, fontSize: "11px", color: "#afa79c", margin: 0, letterSpacing: "0.3px" }}>
                      {timeline}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))}
          </Section>

          <Hr style={{ borderColor: "#f0ece6", margin: "0 48px 36px" }} />

          {/* Support */}
          <Section style={{ padding: "0 48px 48px" }}>
            <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 12px" }}>
              Need Help?
            </Text>
            <Text style={{ ...base, fontSize: "14px", color: "#666052", margin: "0 0 16px", lineHeight: "1.65", fontWeight: "300" }}>
              If you have any questions about your order, our team is happy to help.
            </Text>
            <Row>
              <Column style={{ paddingRight: "12px" }}>
                <Link
                  href="https://wa.me/2348144730948"
                  style={{ ...base, fontSize: "13px", color: "#181b25", fontWeight: "500", textDecoration: "none", borderBottom: "1px solid #181b25", paddingBottom: "2px" }}
                >
                  WhatsApp us
                </Link>
              </Column>
              <Column>
                <Link
                  href="mailto:omosope43@gmail.com"
                  style={{ ...base, fontSize: "13px", color: "#666052", fontWeight: "300", textDecoration: "none" }}
                >
                  omosope43@gmail.com
                </Link>
              </Column>
            </Row>
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: "#f9f8f5", padding: "24px 48px", borderTop: "1px solid #f0ece6" }}>
            <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.5px", color: "#bbb6aa", textTransform: "uppercase", margin: 0, textAlign: "center" }}>
              © 2026 MoLuxury · Lagos, Nigeria
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

export default CustomerOrderConfirmationEmail;
