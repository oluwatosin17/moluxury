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
} from "@react-email/components";

export interface OrderItem {
  name: string;
  length: string;
  density: string;
  quantity: number;
  priceNum: number;
}

export interface OrderConfirmationEmailProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  notes?: string;
}

const base: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

function fmt(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export function OrderConfirmationEmail({
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  items,
  total,
  notes,
}: OrderConfirmationEmailProps) {
  const firstName = customerName.split(" ")[0] || customerName;

  return (
    <Html>
      <Head />
      <Preview>New order from {customerName} — {fmt(total)}</Preview>
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

          {/* Body */}
          <Section style={{ padding: "40px 48px" }}>
            <Text style={{ ...base, fontSize: "11px", letterSpacing: "2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 12px" }}>
              New Order
            </Text>
            <Text style={{ ...base, fontSize: "28px", letterSpacing: "-1px", color: "#181b25", margin: "0 0 8px", lineHeight: "1.2" }}>
              {firstName}&apos;s Order
            </Text>
            <Text style={{ ...base, fontSize: "14px", color: "#666052", margin: "0 0 36px", lineHeight: "1.6", fontWeight: "300" }}>
              A new order has been placed on the MoLuxury studio. The customer has indicated payment has been made. Review the details below and verify the bank transfer before processing.
            </Text>

            <Hr style={{ borderColor: "#f0ece6", margin: "0 0 32px" }} />

            {/* Customer details */}
            <Row style={{ marginBottom: "20px" }}>
              <Column style={{ width: "50%", paddingRight: "16px" }}>
                <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 4px" }}>
                  Customer
                </Text>
                <Text style={{ ...base, fontSize: "16px", color: "#181b25", margin: 0, fontWeight: "500" }}>
                  {customerName}
                </Text>
              </Column>
              <Column style={{ width: "50%", paddingLeft: "16px" }}>
                <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 4px" }}>
                  Email
                </Text>
                <Text style={{ ...base, fontSize: "16px", color: "#181b25", margin: 0, fontWeight: "500" }}>
                  {customerEmail}
                </Text>
              </Column>
            </Row>

            <Row style={{ marginBottom: "32px" }}>
              <Column style={{ width: "50%", paddingRight: "16px" }}>
                <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 4px" }}>
                  Phone
                </Text>
                <Text style={{ ...base, fontSize: "16px", color: "#181b25", margin: 0, fontWeight: "500" }}>
                  {customerPhone}
                </Text>
              </Column>
              <Column style={{ width: "50%", paddingLeft: "16px" }}>
                <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 4px" }}>
                  Ship To
                </Text>
                <Text style={{ ...base, fontSize: "16px", color: "#181b25", margin: 0, fontWeight: "500" }}>
                  {customerAddress}
                </Text>
              </Column>
            </Row>

            <Hr style={{ borderColor: "#f0ece6", margin: "0 0 28px" }} />

            {/* Order items */}
            <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 16px" }}>
              Order Items
            </Text>

            {items.map((item, i) => (
              <Section key={i} style={{ backgroundColor: "#f9f8f5", borderRadius: "4px", padding: "16px 20px", marginBottom: "4px" }}>
                <Row>
                  <Column style={{ width: "60%" }}>
                    <Text style={{ ...base, fontSize: "14px", color: "#181b25", margin: "0 0 4px", fontWeight: "500", lineHeight: "1.3" }}>
                      {item.name}
                    </Text>
                    <Text style={{ ...base, fontSize: "11px", color: "#afa79c", margin: 0 }}>
                      {item.length} · {item.density} · Qty {item.quantity}
                    </Text>
                  </Column>
                  <Column style={{ width: "40%", textAlign: "right" }}>
                    <Text style={{ ...base, fontSize: "15px", color: "#181b25", margin: 0, fontWeight: "500" }}>
                      {fmt(item.priceNum * item.quantity)}
                    </Text>
                  </Column>
                </Row>
              </Section>
            ))}

            {/* Total */}
            <Section style={{ backgroundColor: "#181b25", borderRadius: "4px", padding: "16px 20px", marginTop: "4px", marginBottom: "32px" }}>
              <Row>
                <Column style={{ width: "60%" }}>
                  <Text style={{ ...base, fontSize: "11px", letterSpacing: "1.2px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", margin: 0 }}>
                    Total Paid
                  </Text>
                </Column>
                <Column style={{ width: "40%", textAlign: "right" }}>
                  <Text style={{ ...base, fontSize: "18px", color: "#ffffff", margin: 0, fontWeight: "600", letterSpacing: "-0.5px" }}>
                    {fmt(total)}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Payment reminder */}
            <Section style={{ backgroundColor: "#fffbf4", border: "1px solid #f0ece6", borderRadius: "4px", padding: "16px 20px", marginBottom: "32px" }}>
              <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 6px" }}>
                Payment Verification
              </Text>
              <Text style={{ ...base, fontSize: "13px", color: "#666052", margin: 0, lineHeight: "1.6", fontWeight: "300" }}>
                Verify that {fmt(total)} has been received into the Opay account (8144730948 · MoLuxury) before processing this order. A proof of payment may be attached to this email.
              </Text>
            </Section>

            {notes && (
              <>
                <Hr style={{ borderColor: "#f0ece6", margin: "0 0 28px" }} />
                <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 8px" }}>
                  Customer Notes
                </Text>
                <Text style={{ ...base, fontSize: "14px", color: "#181b25", margin: 0, lineHeight: "1.6", fontWeight: "300" }}>
                  {notes}
                </Text>
              </>
            )}

            <Hr style={{ borderColor: "#f0ece6", margin: "32px 0" }} />

            <Text style={{ ...base, fontSize: "13px", color: "#666052", margin: 0, lineHeight: "1.7", fontWeight: "300" }}>
              Once payment is confirmed, notify the customer at {customerEmail} and prepare the order for dispatch.
            </Text>
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

export default OrderConfirmationEmail;
