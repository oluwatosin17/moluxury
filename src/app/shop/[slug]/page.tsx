import type { Metadata } from "next";
import { products } from "@/lib/products";
import ProductClient from "./client";

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) return { title: "Wig Not Found" };

  const title = product.name;
  const description =
    product.description ||
    `Shop ${product.name} — a premium human hair wig from MoLuxury. ${product.price}. Available in multiple lengths and densities.`;

  return {
    title,
    description,
    alternates: { canonical: `/shop/${params.slug}` },
    openGraph: {
      title: `${title} | MoLuxury`,
      description,
      url: `/shop/${params.slug}`,
      images: [{ url: product.src.startsWith("/") ? product.src : "/og-default.jpg", width: 800, height: 900, alt: title }],
    },
    other: {
      "product:price:amount": String(product.priceNum),
      "product:price:currency": "NGN",
    },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  return <ProductClient params={params} />;
}
