import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Wigs",
  description:
    "Browse MoLuxury's full collection of premium human hair wigs. Body wave, silky straight, HD lace, kinky coils and more — all hand-finished in Lagos.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop All Wigs | MoLuxury",
    description:
      "Browse our full collection of premium human hair wigs — body wave, silky straight, HD lace, kinky coils and more.",
    url: "/shop",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
};
