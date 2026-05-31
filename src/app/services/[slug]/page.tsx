import type { Metadata } from "next";
import ServiceDetailClient from "./client";

const SERVICE_META: Record<string, { title: string; description: string }> = {
  "wig-styling": {
    title: "Wig Styling",
    description:
      "Professional wig styling service at MoLuxury — curls, waves, sleek press, fitted to your event and finished by hand. From ₦25,000.",
  },
  "wig-revamping": {
    title: "Wig Revamping",
    description:
      "Restore your worn wig to its original beauty. MoLuxury's revamping service includes deep cleansing, conditioning, lace tinting, and precision restyling. From ₦25,000.",
  },
  "wig-installation": {
    title: "Wig Installation",
    description:
      "Seamless professional wig installation at MoLuxury. Natural hairline mapping, lace tinting, secure adhesive application, and blending for an undetectable finish. From ₦20,000.",
  },
  "wig-coloring": {
    title: "Wig Coloring",
    description:
      "Custom wig colouring service at MoLuxury. Balayage, highlights, full colour — tailored to your vision with strand testing and deep conditioning. From ₦35,000.",
  },
  "wig-maintenance": {
    title: "Wig Maintenance",
    description:
      "Professional wig maintenance at MoLuxury — deep cleaning, conditioning, detangling and care to extend the life of your wig. From ₦15,000.",
  },
  "custom-consultation": {
    title: "Custom Hair Consultation",
    description:
      "One-on-one MoLuxury consultation to find your perfect wig — texture, length, lace type, density, all tailored to your face shape, lifestyle, and aesthetic.",
  },
};

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const meta = SERVICE_META[params.slug];
  if (!meta) return { title: "Service" };
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/services/${params.slug}` },
    openGraph: {
      title: `${meta.title} | MoLuxury`,
      description: meta.description,
      url: `/services/${params.slug}`,
      images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
    },
  };
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  return <ServiceDetailClient params={params} />;
}
