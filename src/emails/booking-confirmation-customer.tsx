import {
  Body, Container, Head, Hr, Html, Preview, Section, Text, Row, Column,
} from "@react-email/components";

interface BookingConfirmationCustomerProps {
  serviceName: string;
  customerName: string;
  preferredDate: string;
  contactMethod: "whatsapp" | "email";
  contactValue: string;
}

const base: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

export function BookingConfirmationCustomerEmail({
  serviceName,
  customerName,
  preferredDate,
  contactMethod,
  contactValue,
}: BookingConfirmationCustomerProps) {
  return (
    <Html>
      <Head />
      <Preview>Your {serviceName} booking is received — MoLuxury Studio</Preview>
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
              Booking Received
            </Text>
            <Text style={{ ...base, fontSize: "28px", letterSpacing: "-1px", color: "#181b25", margin: "0 0 8px", lineHeight: "1.2" }}>
              Thank you, {customerName}.
            </Text>
            <Text style={{ ...base, fontSize: "14px", color: "#666052", margin: "0 0 32px", lineHeight: "1.7", fontWeight: "300" }}>
              Your booking request for <strong style={{ color: "#181b25", fontWeight: "500" }}>{serviceName}</strong> has been received.
              Our team will review your request and reach out to confirm your appointment shortly.
            </Text>

            <Hr style={{ borderColor: "#f0ece6", margin: "0 0 32px" }} />

            {/* Booking summary */}
            <Row style={{ marginBottom: "20px" }}>
              <Column style={{ width: "50%", paddingRight: "16px" }}>
                <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 4px" }}>
                  Service
                </Text>
                <Text style={{ ...base, fontSize: "16px", color: "#181b25", margin: 0, fontWeight: "500" }}>
                  {serviceName}
                </Text>
              </Column>
              <Column style={{ width: "50%", paddingLeft: "16px" }}>
                <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 4px" }}>
                  Preferred Date
                </Text>
                <Text style={{ ...base, fontSize: "16px", color: "#181b25", margin: 0, fontWeight: "500" }}>
                  {preferredDate}
                </Text>
              </Column>
            </Row>

            <Row style={{ marginBottom: "32px" }}>
              <Column style={{ width: "50%", paddingRight: "16px" }}>
                <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 4px" }}>
                  Your Name
                </Text>
                <Text style={{ ...base, fontSize: "16px", color: "#181b25", margin: 0, fontWeight: "500" }}>
                  {customerName}
                </Text>
              </Column>
              <Column style={{ width: "50%", paddingLeft: "16px" }}>
                <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 4px" }}>
                  We Will Contact Via
                </Text>
                <Text style={{ ...base, fontSize: "16px", color: "#181b25", margin: 0, fontWeight: "500" }}>
                  {contactMethod === "whatsapp" ? `WhatsApp (${contactValue})` : "Email"}
                </Text>
              </Column>
            </Row>

            {/* What to expect */}
            <Section style={{ backgroundColor: "#f9f8f5", borderRadius: "4px", padding: "20px 24px", marginBottom: "32px" }}>
              <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 10px" }}>
                What happens next
              </Text>
              <Text style={{ ...base, fontSize: "13px", color: "#666052", margin: "0 0 6px", lineHeight: "1.7", fontWeight: "300" }}>
                1. Our team reviews your request (typically within a few hours).
              </Text>
              <Text style={{ ...base, fontSize: "13px", color: "#666052", margin: "0 0 6px", lineHeight: "1.7", fontWeight: "300" }}>
                2. We confirm availability and share session details via {contactMethod === "whatsapp" ? "WhatsApp" : "email"}.
              </Text>
              <Text style={{ ...base, fontSize: "13px", color: "#666052", margin: 0, lineHeight: "1.7", fontWeight: "300" }}>
                3. Your appointment is locked in. Luxury is never rushed.
              </Text>
            </Section>

            <Hr style={{ borderColor: "#f0ece6", margin: "0 0 32px" }} />

            <Text style={{ ...base, fontSize: "13px", color: "#666052", margin: 0, lineHeight: "1.7", fontWeight: "300" }}>
              Questions? Reach us on WhatsApp at <strong style={{ color: "#181b25" }}>+234 814 473 0948</strong> or simply reply to this email.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: "#181b25", padding: "24px 48px" }}>
            <Text style={{ ...base, fontSize: "11px", letterSpacing: "1px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", margin: 0, textAlign: "center" }}>
              © 2026 MoLuxury · Lagos, Nigeria
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

export default BookingConfirmationCustomerEmail;
