import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductClient from "./client";
import { getProductBySlug, getAllProducts } from "@/lib/supabase/storefront";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Wig Not Found" };

  const title = product.name;
  const description =
    product.description ||
    `Shop ${product.name} — a premium human hair wig from MoLuxury. ₦${product.price_naira.toLocaleString("en-NG")}. Available in multiple lengths and densities.`;
  const image = product.images[0] ?? "/og-default.jpg";

  return {
    title,
    description,
    alternates: { canonical: `/shop/${params.slug}` },
    openGraph: {
      title: `${title} | MoLuxury`,
      description,
      url: `/shop/${params.slug}`,
      images: [{ url: image.startsWith("/") ? image : "/og-default.jpg", width: 800, height: 900, alt: title }],
    },
    other: {
      "product:price:amount": String(product.price_naira),
      "product:price:currency": "NGN",
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, allProducts] = await Promise.all([
    getProductBySlug(params.slug),
    getAllProducts(),
  ]);

  if (!product) notFound();

  // Related: same category, different slug, up to 3
  const related = (() => {
    const sameCat = allProducts.filter(
      (p) => p.slug !== product.slug && p.category_slugs.some((c) => product.category_slugs.includes(c))
    );
    if (sameCat.length >= 3) return sameCat.slice(0, 3);
    const others = allProducts.filter((p) => p.slug !== product.slug && !sameCat.includes(p));
    return [...sameCat, ...others].slice(0, 3);
  })();

  return <ProductClient product={product} relatedProducts={related} />;
}
