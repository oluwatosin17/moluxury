import type { Metadata } from "next";
import ServicesClient from "./client";

export const metadata: Metadata = {
  title: "Luxury Hair Services",
  description:
    "Professional wig installation, revamping, coloring, styling, maintenance and custom consultations — all performed with precision and care at MoLuxury Studio, Lagos.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Luxury Hair Services | MoLuxury",
    description:
      "Professional wig installation, revamping, coloring, styling, maintenance and custom consultations at MoLuxury Studio.",
    url: "/services",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
};

export default function ServicesPage() {
  return <ServicesClient />;
}
