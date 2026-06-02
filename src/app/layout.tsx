import type { Metadata } from "next";
import { Cormorant_Garamond, Inter_Tight } from "next/font/google";
import "./globals.css";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CartProvider } from "@/lib/cart-context";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter-tight",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://moluxury.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "MoLuxury | Premium Human Hair Wigs & Luxury Hair Services",
    template: "%s | MoLuxury",
  },
  description:
    "Discover premium human hair wigs, luxury hair installations, wig revamping, consultations, and bespoke hair experiences crafted for elegance and confidence.",
  keywords: [
    "luxury wigs", "human hair wigs Lagos", "wig installation Lagos",
    "premium wigs Nigeria", "MoLuxury", "HD lace wigs", "wig coloring",
    "wig revamping", "custom consultation wig", "body wave wig",
  ],
  authors: [{ name: "MoLuxury" }],
  creator: "MoLuxury",
  publisher: "MoLuxury",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: BASE_URL,
    siteName: "MoLuxury",
    title: "MoLuxury | Premium Human Hair Wigs & Luxury Hair Services",
    description:
      "Discover premium human hair wigs, luxury hair installations, wig revamping, consultations, and bespoke hair experiences crafted for elegance and confidence.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "MoLuxury — Premium Human Hair Wigs & Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoLuxury | Premium Human Hair Wigs & Luxury Hair Services",
    description:
      "Premium human hair wigs and luxury hair services designed in Lagos and worn everywhere.",
    images: ["/og-default.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ rel: "manifest", url: "/site.webmanifest" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: BASE_URL },
};

// Global JSON-LD structured data
const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "MoLuxury",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/android-chrome-512x512.png` },
      description:
        "Premium human hair wigs and luxury wig services designed in Lagos and worn everywhere.",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+2348144730948",
        contactType: "customer service",
        availableLanguage: "English",
      },
      sameAs: [
        "https://www.instagram.com/moluxury._",
        "https://www.tiktok.com/@moluxuryhairs",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "MoLuxury",
      publisher: { "@id": `${BASE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/shop?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${cormorant.variable} ${interTight.variable} antialiased`}>
        <WishlistProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
