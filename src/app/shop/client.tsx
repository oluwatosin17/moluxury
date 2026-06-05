"use client";
import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { HeartLine, HeartFill } from "@mingcute/react";
import Navbar from "@/components/navbar";
import WishlistOverlay from "@/components/wishlist-overlay";
import HeartParticleLayer from "@/components/heart-particle-layer";
import FixedSearch from "@/components/fixed-search";
import CartOverlay from "@/components/cart-overlay";
import Footer from "@/components/footer";
import { useWishlist } from "@/lib/wishlist-context";
import { getImageUrl } from "@/lib/supabase/utils";
import { playLike, playUnlike } from "@/lib/sound";
import type { DBProduct } from "@/lib/supabase/types";

type FilterKey =
  | "All Pieces"
  | "Body Wave"
  | "Pixie Curl"
  | "Silky Straight"
  | "Coily Press"
  | "New in"
  | "Bestsellers"
  | "Trending"
  | "Handpicked";

type SortKey =
  | "Relevance"
  | "Newest First"
  | "Price: Low to High"
  | "Price: High to Low"
  | "A-Z"
  | "Z-A";

const FILTERS: FilterKey[] = [
  "All Pieces",
  "Body Wave",
  "Pixie Curl",
  "Silky Straight",
  "Coily Press",
  "New in",
  "Bestsellers",
  "Trending",
  "Handpicked",
];

const SORTS: SortKey[] = [
  "Relevance",
  "Newest First",
  "Price: Low to High",
  "Price: High to Low",
  "A-Z",
  "Z-A",
];

// Maps filter label → Supabase category_slugs value
const FILTER_TO_SLUG: Record<FilterKey, string> = {
  "All Pieces":     "",
  "Body Wave":      "body-wave",
  "Pixie Curl":     "pixie-curl",
  "Silky Straight": "silky-straight",
  "Coily Press":    "coily-press",
  "New in":         "new-in",
  "Bestsellers":    "bestsellers",
  "Trending":       "trending",
  "Handpicked":     "handpicked",
};

function fmtPrice(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function primaryImage(p: DBProduct) {
  return getImageUrl(p.images[0] ?? `/products/${p.slug}-1.jpg`);
}

function ShopContent({ products }: { products: DBProduct[] }) {
  const searchParams = useSearchParams();
  const initialFilter = (() => {
    const f = searchParams.get("filter");
    return f && FILTERS.includes(f as FilterKey) ? (f as FilterKey) : "All Pieces";
  })();

  const [activeFilter, setActiveFilter] = useState<FilterKey>(initialFilter);
  const [activeSort, setActiveSort] = useState<SortKey>("Relevance");
  const [sortOpen, setSortOpen] = useState(false);
  const [animating, setAnimating] = useState<Set<string>>(new Set());
  const { toggleItem, isLiked } = useWishlist();
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sortOpen]);

  const handleHeart = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, product: DBProduct) => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const wasLiked = isLiked(product.name);
      toggleItem({ name: product.name, price: fmtPrice(product.price_naira), src: primaryImage(product) });
      if (!wasLiked) {
        playLike();
        window.dispatchEvent(new CustomEvent("wishlist:heart-spawn", { detail: { x: cx, y: cy } }));
      } else {
        playUnlike();
      }
      setAnimating((prev) => new Set([...prev, product.name]));
      setTimeout(() => {
        setAnimating((prev) => {
          const next = new Set(prev);
          next.delete(product.name);
          return next;
        });
      }, 400);
    },
    [toggleItem, isLiked]
  );

  const filtered =
    activeFilter === "All Pieces"
      ? products
      : products.filter((p) => p.category_slugs.includes(FILTER_TO_SLUG[activeFilter]));

  const sorted = [...filtered].sort((a, b) => {
    if (activeSort === "Newest First")         return b.display_order - a.display_order;
    if (activeSort === "Price: Low to High")   return a.price_naira - b.price_naira;
    if (activeSort === "Price: High to Low")   return b.price_naira - a.price_naira;
    if (activeSort === "A-Z")                  return a.name.localeCompare(b.name);
    if (activeSort === "Z-A")                  return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <>
      <Navbar />
      <WishlistOverlay />
      <CartOverlay />
      <HeartParticleLayer />
      <FixedSearch />
      <main className="bg-surface min-h-screen">
        {/* Filter + Sort bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 lg:px-20 pt-[72px] lg:pt-[88px] pb-4 lg:pb-6 w-full gap-3">
          <div className="flex items-center gap-2 lg:gap-3 overflow-x-auto scrollbar-hide pb-1 sm:pb-0 flex-nowrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`font-cormorant italic text-[20px] lg:text-[28px] tracking-[-2px] lg:tracking-[-3px] leading-normal transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  f === activeFilter ? "text-primary" : "text-[#aea899] hover:text-primary/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative flex-shrink-0 sm:ml-10" ref={sortRef}>
            <button onClick={() => setSortOpen((v) => !v)} className="flex items-center gap-1 cursor-pointer">
              <span className="font-inter-tight text-[13px] lg:text-[16px] tracking-[-0.1px] text-[#9b9483] leading-normal">Sort by</span>
              <span className="font-inter-tight text-[13px] lg:text-[16px] tracking-[-0.1px] text-primary leading-normal ml-1">{activeSort}</span>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}>
                <path d="M5 7.5l5 5 5-5" stroke="#181b25" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-black/8 rounded-[8px] shadow-md z-30 min-w-[200px] overflow-hidden">
                {SORTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setActiveSort(s); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-3 font-inter-tight text-[13px] lg:text-[14px] tracking-[-0.1px] transition-colors cursor-pointer hover:bg-surface ${
                      s === activeSort ? "text-primary font-medium" : "text-secondary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 lg:px-20 pb-3">
          <span className="font-inter-tight text-[12px] lg:text-[13px] tracking-[-0.1px] text-muted">
            {sorted.length} {sorted.length === 1 ? "piece" : "pieces"}
          </span>
        </div>

        {sorted.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
            {sorted.map((product, colIdx) => (
              <Link key={product.slug} href={`/shop/${product.slug}`} className="flex flex-col group">
                <div className="relative w-full h-[260px] sm:h-[380px] lg:h-[580px] rounded-[2px] overflow-hidden">
                  <Image
                    src={primaryImage(product)}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    unoptimized
                    priority={colIdx < 4}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleHeart(e, product); }}
                    aria-label={isLiked(product.name) ? "Remove from wishlist" : "Add to wishlist"}
                    className={`absolute bottom-[12px] right-[12px] size-10 lg:size-12 rounded-full flex items-center justify-center transition-all duration-150 active:scale-[0.82] cursor-pointer ${
                      isLiked(product.name) ? "bg-black/50" : "bg-black/30 hover:bg-black/50"
                    } ${animating.has(product.name) ? "animate-heart-pop" : ""}`}
                  >
                    {isLiked(product.name) ? <HeartFill size={16} color="white" /> : <HeartLine size={16} color="white" />}
                  </button>
                </div>
                <div className="flex flex-col gap-1 lg:gap-2 p-3 lg:p-4">
                  <span className="font-inter-tight text-[13px] lg:text-[18px] tracking-[-0.5px] lg:tracking-[-1px] text-primary leading-normal line-clamp-1">
                    {product.name}
                  </span>
                  <span className="font-inter-tight font-light text-[12px] lg:text-[15px] tracking-[-0.3px] text-secondary leading-normal">
                    {fmtPrice(product.price_naira)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 lg:py-32 gap-10 lg:gap-[59px] text-center px-4 lg:px-8">
            <div className="flex flex-col gap-4 max-w-[733px] items-center">
              <span className="font-inter-tight text-[14px] lg:text-[16px] tracking-[-0.2px] text-[#aea899] leading-normal">No pieces found</span>
              <p className="font-cormorant italic text-[32px] lg:text-[56px] tracking-[-3px] text-primary leading-normal">
                Luxury is personal, sometimes the right piece takes a little more searching.
              </p>
            </div>
            <button
              onClick={() => setActiveFilter("All Pieces")}
              className="bg-primary text-white rounded-full px-6 py-3 font-inter-tight font-medium text-[14px] cursor-pointer hover:bg-primary/90 transition-colors"
            >
              Browse all wigs
            </button>
          </div>
        )}

        <div className="mt-24">
          <Footer />
        </div>
      </main>
    </>
  );
}

export default function ShopClient({ products }: { products: DBProduct[] }) {
  return (
    <Suspense>
      <ShopContent products={products} />
    </Suspense>
  );
}
