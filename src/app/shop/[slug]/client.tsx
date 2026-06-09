"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { HeartLine, HeartFill } from "@mingcute/react";
import Navbar from "@/components/navbar";
import WishlistOverlay from "@/components/wishlist-overlay";
import HeartParticleLayer from "@/components/heart-particle-layer";
import FixedSearch from "@/components/fixed-search";
import CartOverlay from "@/components/cart-overlay";
import Footer from "@/components/footer";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { getImageUrl } from "@/lib/supabase/utils";
import { playLike, playUnlike, playAddToCart } from "@/lib/sound";
import type { DBProduct } from "@/lib/supabase/types";

function fmtPrice(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

// Map category slug → display label for breadcrumb
const SLUG_TO_LABEL: Record<string, string> = {
  "body-wave":      "Body Wave",
  "pixie-curl":     "Pixie Curl",
  "silky-straight": "Silky Straight",
  "coily-press":    "Coily Press",
  "new-in":         "New in",
  "bestsellers":    "Bestsellers",
  "trending":       "Trending",
  "handpicked":     "Handpicked",
};

const TEXTURE_CATS = ["body-wave", "pixie-curl", "silky-straight", "coily-press"];

interface Props {
  product: DBProduct;
  relatedProducts: DBProduct[];
}

export default function ProductClient({ product, relatedProducts }: Props) {
  // Primary texture category for breadcrumb
  const primaryCatSlug =
    TEXTURE_CATS.find((c) => product.category_slugs.includes(c)) ??
    product.category_slugs[0] ??
    "new-in";
  const primaryCatLabel = SLUG_TO_LABEL[primaryCatSlug] ?? primaryCatSlug;

  // Gallery: use product.images; fall back to public path if empty
  const gallery = product.images.length > 0
    ? product.images.map(getImageUrl)
    : [`/products/${product.slug}-1.jpg`];
  const showGallery = gallery.length >= 2;

  // Lengths / densities from DB, with sane defaults
  const lengths = product.available_lengths.length > 0
    ? product.available_lengths
    : [`18"`, `20"`, `22"`, `24"`, `26"`, `28"`];
  const densities = product.available_densities.length > 0
    ? product.available_densities
    : ["150%", "180%", "200%", "250%"];

  const [activeThumb, setActiveThumb]       = useState(0);
  const [selectedLength, setSelectedLength] = useState(
    lengths.includes(`24"`) ? `24"` : lengths[0]
  );
  const [selectedDensity, setSelectedDensity] = useState(
    densities.includes("200%") ? "200%" : densities[0]
  );

  const cfg = product.pricing_config;
  const displayedPrice = cfg
    ? product.price_naira +
      (cfg.length_surcharges[selectedLength] ?? 0) +
      (cfg.density_surcharges[selectedDensity] ?? 0)
    : product.price_naira;

  const { toggleItem, isLiked } = useWishlist();
  const { addItem } = useCart();

  const imageRef   = useRef<HTMLDivElement>(null);
  const infoRef    = useRef<HTMLDivElement>(null);
  const mainImgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(imageRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5 });
    tl.fromTo(infoRef.current,  { opacity: 0, x:  20 }, { opacity: 1, x: 0, duration: 0.5 }, "-=0.4");
  }, []);

  const switchThumb = (i: number) => {
    if (i === activeThumb) return;
    gsap.to(mainImgRef.current, {
      opacity: 0, scale: 0.98, duration: 0.15, ease: "power2.in",
      onComplete: () => {
        setActiveThumb(i);
        gsap.to(mainImgRef.current, { opacity: 1, scale: 1, duration: 0.22, ease: "power2.out" });
      },
    });
  };

  const handleWishlist = useCallback(() => {
    const wasLiked = isLiked(product.name);
    toggleItem({ name: product.name, price: fmtPrice(product.price_naira), src: gallery[0] });
    if (wasLiked) playUnlike(); else playLike();
  }, [product, gallery, toggleItem, isLiked]);

  const handleAddToCart = () => {
    addItem({
      name: product.name,
      price: fmtPrice(displayedPrice),
      priceNum: displayedPrice,
      src: gallery[0],
      slug: product.slug,
      length: selectedLength,
      density: selectedDensity,
    });
    playAddToCart();
  };

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://moluxury.vercel.app";
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? `${product.name} — premium human hair wig from MoLuxury.`,
    image: gallery[0].startsWith("/") ? `${BASE_URL}${gallery[0]}` : gallery[0],
    brand: { "@type": "Brand", name: "MoLuxury" },
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: product.price_naira,   // base price in schema
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}/shop/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <Navbar />
      <WishlistOverlay />
      <CartOverlay />
      <HeartParticleLayer />
      <FixedSearch />

      <main className="bg-surface min-h-screen">
        {/* Breadcrumb */}
        <div className="px-4 lg:px-20 pt-[72px] lg:pt-[88px] pb-5 lg:pb-8">
          <nav className="flex items-center gap-2">
            <Link href="/shop" className="font-inter-tight text-[11px] tracking-[1.5px] text-secondary uppercase hover:text-primary transition-colors">SHOP</Link>
            <span className="font-inter-tight text-[11px] text-secondary/50">/</span>
            <Link href={`/shop?filter=${encodeURIComponent(primaryCatLabel)}`} className="font-inter-tight text-[11px] tracking-[1.5px] text-secondary uppercase hover:text-primary transition-colors">
              {primaryCatLabel.toUpperCase()}
            </Link>
            <span className="font-inter-tight text-[11px] text-secondary/50">/</span>
            <span className="font-inter-tight text-[11px] tracking-[1.5px] text-primary uppercase">{product.slug.toUpperCase()}</span>
          </nav>
        </div>

        {/* Product detail */}
        <div className="px-4 lg:px-20 pb-16 lg:pb-20">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start lg:justify-center">

            {/* Left: gallery */}
            <div ref={imageRef} className="flex-shrink-0 w-full lg:w-auto">
              <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">
                {showGallery && (
                  <div className="flex lg:flex-col gap-2 order-2 lg:order-1 lg:w-[80px] overflow-x-auto scrollbar-hide">
                    {gallery.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => switchThumb(i)}
                        className={`relative w-[72px] h-[80px] lg:w-[80px] lg:h-[88px] rounded-[2px] overflow-hidden shrink-0 cursor-pointer transition-opacity ${
                          i === activeThumb ? "ring-1 ring-primary opacity-100" : "opacity-50 hover:opacity-80"
                        }`}
                      >
                        <Image src={src} alt={`${product.name} view ${i + 1}`} fill className="object-cover" unoptimized />
                      </button>
                    ))}
                  </div>
                )}
                <div
                  ref={mainImgRef}
                  className="relative w-full h-[380px] sm:h-[480px] lg:w-[576px] lg:h-[634px] rounded-[2px] overflow-hidden order-1 lg:order-2"
                >
                  <Image src={gallery[activeThumb]} alt={product.name} fill className="object-cover transition-opacity duration-300" unoptimized priority />
                </div>
              </div>
            </div>

            {/* Right: info */}
            <div ref={infoRef} className="flex flex-col gap-5 lg:gap-6 w-full lg:w-[478px] lg:pt-2">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="font-cormorant font-semibold italic text-[32px] lg:text-[44px] tracking-[-2px] text-primary leading-[1.1]">
                    {product.name}
                  </h1>
                  <button
                    onClick={handleWishlist}
                    aria-label={isLiked(product.name) ? "Remove from wishlist" : "Add to wishlist"}
                    className="mt-2 flex-shrink-0 size-10 rounded-full flex items-center justify-center border border-black/10 hover:border-primary transition-colors cursor-pointer"
                  >
                    {isLiked(product.name) ? <HeartFill size={18} color="#181b25" /> : <HeartLine size={18} color="#181b25" />}
                  </button>
                </div>
                <span className="font-inter-tight text-[20px] tracking-[-0.5px] text-secondary transition-all duration-150">
                  {fmtPrice(displayedPrice)}
                </span>
              </div>

              {product.description && (
                <p className="font-inter-tight font-light text-[14px] tracking-[-0.1px] text-secondary leading-[1.7]">
                  {product.description}
                </p>
              )}

              {/* Specs */}
              <div className="flex gap-8 pt-2 pb-2 border-t border-b border-black/8">
                {product.texture && (
                  <div className="flex flex-col gap-1">
                    <span className="font-inter-tight text-[10px] tracking-[1.5px] text-secondary/60 uppercase">TEXTURE</span>
                    <span className="font-inter-tight text-[13px] tracking-[-0.2px] text-primary">{product.texture}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <span className="font-inter-tight text-[10px] tracking-[1.5px] text-secondary/60 uppercase">CAP</span>
                  <span className="font-inter-tight text-[13px] tracking-[-0.2px] text-primary">{product.cap_type}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-inter-tight text-[10px] tracking-[1.5px] text-secondary/60 uppercase">ORIGIN</span>
                  <span className="font-inter-tight text-[13px] tracking-[-0.2px] text-primary">{product.origin}</span>
                </div>
              </div>

              {/* Length selector */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-inter-tight text-[11px] tracking-[1.2px] text-secondary uppercase">LENGTH</span>
                  <span className="font-inter-tight font-medium text-[13px] text-primary">{selectedLength}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {lengths.map((len) => (
                    <button
                      key={len}
                      onClick={() => setSelectedLength(len)}
                      className={`px-4 py-2 rounded-[24px] font-inter-tight text-[13px] tracking-[-0.1px] border transition-all cursor-pointer ${
                        len === selectedLength ? "bg-primary text-white border-primary" : "border-black/15 text-secondary hover:border-black/40"
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>

              {/* Density selector */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-inter-tight text-[11px] tracking-[1.2px] text-secondary uppercase">DENSITY</span>
                  <span className="font-inter-tight font-medium text-[13px] text-primary">{selectedDensity}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {densities.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDensity(d)}
                      className={`px-4 py-2 rounded-[24px] font-inter-tight text-[13px] tracking-[-0.1px] border transition-all cursor-pointer ${
                        d === selectedDensity ? "bg-primary text-white border-primary" : "border-black/15 text-secondary hover:border-black/40"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 rounded-[32px] font-inter-tight font-medium text-[15px] tracking-[1px] uppercase transition-all cursor-pointer mt-2 bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"
              >
                Add to Cart
              </button>

              <p className="font-inter-tight text-[11px] tracking-[-0.1px] text-secondary/60 text-center">
                Free shipping on orders over ₦300,000 · Delivery in 3–5 business days
              </p>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="px-4 lg:px-20 pb-16 lg:pb-20 border-t border-black/8 pt-12 lg:pt-16">
            <h2 className="font-cormorant italic text-[24px] lg:text-[32px] tracking-[-2px] text-primary mb-6 lg:mb-10">
              You might also like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
              {relatedProducts.map((p) => {
                const src = getImageUrl(p.images[0] ?? `/products/${p.slug}-1.jpg`);
                return (
                  <Link key={p.slug} href={`/shop/${p.slug}`} className="flex flex-col group">
                    <div className="relative w-full h-[260px] sm:h-[360px] lg:h-[530px] rounded-[2px] overflow-hidden">
                      <Image src={src} alt={p.name} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" unoptimized />
                    </div>
                    <div className="flex flex-col gap-1 lg:gap-2 p-3 lg:p-4">
                      <span className="font-inter-tight text-[13px] lg:text-[18px] tracking-[-0.5px] lg:tracking-[-1px] text-primary leading-normal group-hover:opacity-70 transition-opacity line-clamp-1">
                        {p.name}
                      </span>
                      <span className="font-inter-tight font-light text-[12px] lg:text-[15px] tracking-[-0.3px] text-secondary">
                        {fmtPrice(p.price_naira)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <Footer />
      </main>
    </>
  );
}
