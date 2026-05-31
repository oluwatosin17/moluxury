"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
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
import { products, type FilterKey } from "@/lib/products";
import { playLike, playUnlike, playAddToCart } from "@/lib/sound";


const CATEGORY_DISPLAY_ORDER: FilterKey[] = [
  "Body Wave", "Pixie Curl", "Silky Straight", "Coily Press",
];

const LENGTHS = [`18"`, `20"`, `22"`, `24"`, `26"`, `28"`];
const DENSITIES = ["150%", "180%", "200%", "250%"];

const SPECS: Record<FilterKey, { texture: string; cap: string; origin: string }> = {
  "Body Wave":      { texture: "Body Wave",      cap: "HD Transparent Lace", origin: "100% Virgin Human Hair" },
  "Pixie Curl":     { texture: "Pixie Curl",     cap: "HD Transparent Lace", origin: "100% Virgin Human Hair" },
  "Silky Straight": { texture: "Silky Straight", cap: "HD Transparent Lace", origin: "100% Virgin Human Hair" },
  "Coily Press":    { texture: "Coily Press",    cap: "HD Transparent Lace", origin: "100% Virgin Human Hair" },
  "All Pieces":     { texture: "Mixed",          cap: "HD Transparent Lace", origin: "100% Virgin Human Hair" },
  "New in":         { texture: "Mixed",          cap: "HD Transparent Lace", origin: "100% Virgin Human Hair" },
  "Bestsellers":    { texture: "Mixed",          cap: "HD Transparent Lace", origin: "100% Virgin Human Hair" },
  "Trending":       { texture: "Mixed",          cap: "HD Transparent Lace", origin: "100% Virgin Human Hair" },
  "Handpicked":     { texture: "Mixed",          cap: "HD Transparent Lace", origin: "100% Virgin Human Hair" },
};

export default function ProductClient({ params: serverParams }: { params?: { slug: string } }) {
  const clientParams = useParams();
  const slug = serverParams?.slug ?? (typeof clientParams.slug === "string" ? clientParams.slug : "");
  const product = products.find((p) => p.slug === slug);

  if (!product) notFound();

  const primaryCategory =
    CATEGORY_DISPLAY_ORDER.find((c) => product.categories.includes(c)) ??
    product.categories[0];

  const specs = SPECS[primaryCategory] ?? SPECS["Body Wave"];

  const showGallery = (product.detailImages?.length ?? 0) >= 2;
  const galleryImages = showGallery ? product.detailImages! : null;

  const productIndex = products.findIndex((p) => p.slug === product.slug);
  const relatedProducts = (() => {
    const sameCat = products.filter(
      (p) => p.slug !== product.slug && p.categories.some((c) => product.categories.includes(c))
    );
    const offset = productIndex % Math.max(sameCat.length, 1);
    const rotated = [...sameCat.slice(offset), ...sameCat.slice(0, offset)];
    if (rotated.length >= 3) return rotated.slice(0, 3);
    // Fill remaining slots from any other product
    const others = products.filter(
      (p) => p.slug !== product.slug && !sameCat.includes(p)
    );
    return [...rotated, ...others].slice(0, 3);
  })();

  const [activeThumb, setActiveThumb] = useState(0);
  const [selectedLength, setSelectedLength] = useState(`24"`);
  const [selectedDensity, setSelectedDensity] = useState("200%");

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
    toggleItem({ name: product.name, price: product.price, src: product.src });
    if (wasLiked) playUnlike(); else playLike();
  }, [product, toggleItem, isLiked]);

  const handleAddToCart = () => {
    const priceNum = parseInt(product.price.replace(/[₦,]/g, ""), 10) || 0;
    addItem({
      name: product.name,
      price: product.price,
      priceNum,
      src: showGallery ? galleryImages![0] : product.src,
      slug: product.slug,
      length: selectedLength,
      density: selectedDensity,
    });
    playAddToCart();
  };

  const BASE_URL = "https://moluxury-obalanatosin16-gmailcoms-projects.vercel.app";
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} — premium human hair wig from MoLuxury.`,
    image: product.src.startsWith("/") ? `${BASE_URL}${product.src}` : product.src,
    brand: { "@type": "Brand", name: "MoLuxury" },
    offers: {
      "@type": "Offer",
      priceCurrency: "NGN",
      price: product.priceNum,
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}/shop/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Navbar />
      <WishlistOverlay />
      <CartOverlay />
      <HeartParticleLayer />
      <FixedSearch />

      <main className="bg-surface min-h-screen">
        {/* Breadcrumb */}
        <div className="px-4 lg:px-20 pt-[72px] lg:pt-[88px] pb-5 lg:pb-8">
          <nav className="flex items-center gap-2">
            <Link
              href="/shop"
              className="font-inter-tight text-[11px] tracking-[1.5px] text-secondary uppercase hover:text-primary transition-colors"
            >
              SHOP
            </Link>
            <span className="font-inter-tight text-[11px] text-secondary/50">/</span>
            <Link
              href={`/shop?filter=${encodeURIComponent(primaryCategory)}`}
              className="font-inter-tight text-[11px] tracking-[1.5px] text-secondary uppercase hover:text-primary transition-colors"
            >
              {primaryCategory.toUpperCase()}
            </Link>
            <span className="font-inter-tight text-[11px] text-secondary/50">/</span>
            <span className="font-inter-tight text-[11px] tracking-[1.5px] text-primary uppercase">
              {product.slug.toUpperCase()}
            </span>
          </nav>
        </div>

        {/* Product detail */}
        <div className="px-4 lg:px-20 pb-16 lg:pb-20">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start lg:justify-center">
            {/* Left: thumbnail strip + main image
                Mobile  → col: [main image order-1] [thumbnail row order-2]
                Desktop → row: [thumbnail col order-1] [main image order-2]
                Single DOM tree — one ref on mainImgRef, GSAP works on both viewports */}
            <div ref={imageRef} className="flex-shrink-0 w-full lg:w-auto">
              <div className="flex flex-col lg:flex-row gap-2 lg:gap-4">

                {/* Thumbnails — row under image on mobile, column left of image on desktop */}
                {showGallery && (
                  <div className="flex lg:flex-col gap-2 order-2 lg:order-1 lg:w-[80px] overflow-x-auto scrollbar-hide">
                    {galleryImages!.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => switchThumb(i)}
                        className={`relative w-[72px] h-[80px] lg:w-[80px] lg:h-[88px] rounded-[2px] overflow-hidden shrink-0 cursor-pointer transition-opacity ${
                          i === activeThumb
                            ? "ring-1 ring-primary opacity-100"
                            : "opacity-50 hover:opacity-80"
                        }`}
                      >
                        <Image
                          src={src}
                          alt={`${product.name} view ${i + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main image */}
                <div
                  ref={mainImgRef}
                  className="relative w-full h-[380px] sm:h-[480px] lg:w-[576px] lg:h-[634px] rounded-[2px] overflow-hidden order-1 lg:order-2"
                >
                  <Image
                    src={showGallery ? galleryImages![activeThumb] : product.src}
                    alt={product.name}
                    fill
                    className="object-cover transition-opacity duration-300"
                    unoptimized
                    priority
                  />
                </div>

              </div>
            </div>

            {/* Right: product info */}
            <div ref={infoRef} className="flex flex-col gap-5 lg:gap-6 w-full lg:w-[478px] lg:pt-2">
              {/* Name + price + wishlist */}
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
                    {isLiked(product.name) ? (
                      <HeartFill size={18} color="#181b25" />
                    ) : (
                      <HeartLine size={18} color="#181b25" />
                    )}
                  </button>
                </div>
                <span className="font-inter-tight text-[20px] tracking-[-0.5px] text-secondary">
                  {product.price}
                </span>
              </div>

              {/* Description */}
              <p className="font-inter-tight font-light text-[14px] tracking-[-0.1px] text-secondary leading-[1.7]">
                {product.description}
              </p>

              {/* Specs */}
              <div className="flex gap-8 pt-2 pb-2 border-t border-b border-black/8">
                <div className="flex flex-col gap-1">
                  <span className="font-inter-tight text-[10px] tracking-[1.5px] text-secondary/60 uppercase">
                    TEXTURE
                  </span>
                  <span className="font-inter-tight text-[13px] tracking-[-0.2px] text-primary">
                    {specs.texture}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-inter-tight text-[10px] tracking-[1.5px] text-secondary/60 uppercase">
                    CAP
                  </span>
                  <span className="font-inter-tight text-[13px] tracking-[-0.2px] text-primary">
                    {specs.cap}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-inter-tight text-[10px] tracking-[1.5px] text-secondary/60 uppercase">
                    ORIGIN
                  </span>
                  <span className="font-inter-tight text-[13px] tracking-[-0.2px] text-primary">
                    {specs.origin}
                  </span>
                </div>
              </div>

              {/* Length selector */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-inter-tight text-[11px] tracking-[1.2px] text-secondary uppercase">
                    LENGTH
                  </span>
                  <span className="font-inter-tight font-medium text-[13px] text-primary">
                    {selectedLength}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {LENGTHS.map((len) => (
                    <button
                      key={len}
                      onClick={() => setSelectedLength(len)}
                      className={`px-4 py-2 rounded-[24px] font-inter-tight text-[13px] tracking-[-0.1px] border transition-all cursor-pointer ${
                        len === selectedLength
                          ? "bg-primary text-white border-primary"
                          : "border-black/15 text-secondary hover:border-black/40"
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
                  <span className="font-inter-tight text-[11px] tracking-[1.2px] text-secondary uppercase">
                    DENSITY
                  </span>
                  <span className="font-inter-tight font-medium text-[13px] text-primary">
                    {selectedDensity}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {DENSITIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDensity(d)}
                      className={`px-4 py-2 rounded-[24px] font-inter-tight text-[13px] tracking-[-0.1px] border transition-all cursor-pointer ${
                        d === selectedDensity
                          ? "bg-primary text-white border-primary"
                          : "border-black/15 text-secondary hover:border-black/40"
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

              {/* Shipping note */}
              <p className="font-inter-tight text-[11px] tracking-[-0.1px] text-secondary/60 text-center">
                Free shipping on orders over ₦300,000 · Delivery in 3–5 business days
              </p>
            </div>
          </div>
        </div>

        {/* You might also like */}
        {relatedProducts.length > 0 && (
          <div className="px-4 lg:px-20 pb-16 lg:pb-20 border-t border-black/8 pt-12 lg:pt-16">
            <h2 className="font-cormorant italic text-[24px] lg:text-[32px] tracking-[-2px] text-primary mb-6 lg:mb-10">
              You might also like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
              {relatedProducts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/shop/${p.slug}`}
                  className="flex flex-col group"
                >
                  <div className="relative w-full h-[260px] sm:h-[360px] lg:h-[530px] rounded-[2px] overflow-hidden">
                    <Image
                      src={p.src}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col gap-1 lg:gap-2 p-3 lg:p-4">
                    <span className="font-inter-tight text-[13px] lg:text-[18px] tracking-[-0.5px] lg:tracking-[-1px] text-primary leading-normal group-hover:opacity-70 transition-opacity line-clamp-1">
                      {p.name}
                    </span>
                    <span className="font-inter-tight font-light text-[12px] lg:text-[15px] tracking-[-0.3px] text-secondary">
                      {p.price}
                    </span>
                  </div>
                </Link>
              ))}
            </div>  {/* grid */}
          </div>
        )}

        <Footer />
      </main>
    </>
  );
}
