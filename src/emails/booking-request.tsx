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

interface BookingRequestEmailProps {
  serviceName: string;
  customerName: string;
  preferredDate: string;
  contactMethod: "whatsapp" | "email";
  contactValue: string;
}

const base: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

export function BookingRequestEmail({
  serviceName,
  customerName,
  preferredDate,
  contactMethod,
  contactValue,
}: BookingRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New booking request for {serviceName} from {customerName}</Preview>
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
              New Request
            </Text>
            <Text style={{ ...base, fontSize: "28px", letterSpacing: "-1px", color: "#181b25", margin: "0 0 8px", lineHeight: "1.2" }}>
              {serviceName}
            </Text>
            <Text style={{ ...base, fontSize: "14px", color: "#666052", margin: "0 0 36px", lineHeight: "1.6", fontWeight: "300" }}>
              A new booking request has been submitted through the MoLuxury studio. Review the details below and follow up with the customer promptly.
            </Text>

            <Hr style={{ borderColor: "#f0ece6", margin: "0 0 32px" }} />

            {/* Details grid */}
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
                  Service Requested
                </Text>
                <Text style={{ ...base, fontSize: "16px", color: "#181b25", margin: 0, fontWeight: "500" }}>
                  {serviceName}
                </Text>
              </Column>
              <Column style={{ width: "50%", paddingLeft: "16px" }}>
                <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 4px" }}>
                  Contact Via
                </Text>
                <Text style={{ ...base, fontSize: "16px", color: "#181b25", margin: 0, fontWeight: "500" }}>
                  {contactMethod === "whatsapp" ? "WhatsApp" : "Email"}
                </Text>
              </Column>
            </Row>

            {/* Contact value */}
            <Section style={{ backgroundColor: "#f9f8f5", borderRadius: "4px", padding: "20px 24px", marginBottom: "32px" }}>
              <Text style={{ ...base, fontSize: "10px", letterSpacing: "1.2px", color: "#afa79c", textTransform: "uppercase", margin: "0 0 6px" }}>
                {contactMethod === "whatsapp" ? "WhatsApp Number" : "Email Address"}
              </Text>
              <Text style={{ ...base, fontSize: "18px", color: "#181b25", margin: 0, fontWeight: "500", letterSpacing: "-0.3px" }}>
                {contactValue}
              </Text>
            </Section>

            <Hr style={{ borderColor: "#f0ece6", margin: "0 0 32px" }} />

            <Text style={{ ...base, fontSize: "13px", color: "#666052", margin: 0, lineHeight: "1.7", fontWeight: "300" }}>
              Please reach out to confirm availability and share session details. Aim to respond within a few hours.
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

export default BookingRequestEmail;
