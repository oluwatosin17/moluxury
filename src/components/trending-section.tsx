"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RightLine, HeartLine, HeartFill } from "@mingcute/react";
import { useWishlist } from "@/lib/wishlist-context";
import { playLike, playUnlike, playTab } from "@/lib/sound";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const tabData = {
  Trending: [
    { src: "/products/bodie-1.jpg", name: `Bodie – Silk Straight Bob • 12"`, price: "₦235,000", slug: "bodie" },
    { src: "/products/imani-1.jpg", name: `Imani - 22" · HD Lace`, price: "₦346,000", slug: "imani" },
    { src: "/products/camille-1.jpg", name: `Camille - Hand-finished body wave · 24"`, price: "₦186,000", slug: "camille" },
    { src: "https://www.figma.com/api/mcp/asset/0cc450b1-6ca1-4837-8250-3f95f340eff3", name: `Zoe - Polished straight finish · 26"`, price: "₦326,000", slug: "zoe" },
  ],
  Bestsellers: [
    { src: "/products/amara-1.jpg", name: `Amara – Honey Highlighted Wave • 20"`, price: "₦295,000", slug: "amara" },
    { src: "https://www.figma.com/api/mcp/asset/fcc754b7-1986-4693-bcdc-266f0bc3d791", name: `Kiki – Bouncy Volumizing Curls • 14"`, price: "₦195,000", slug: "kiki" },
    { src: "/products/naomi-1.jpg", name: `Naomi – Luxury Deep Body Wave • 24"`, price: "₦385,000", slug: "naomi" },
    { src: "/products/sienna-1.jpg", name: `Sienna – Golden Balayage Straight • 22"`, price: "₦315,000", slug: "sienna" },
  ],
  Handpicked: [
    { src: "/products/maya-1.jpg", name: `Maya – Wet & Wavy HD Frontal • 20"`, price: "₦285,000", slug: "maya" },
    { src: "/products/zuri-1.jpg", name: `Zuri – Premium Afro Kinky Coils • 18"`, price: "₦260,000", slug: "zuri" },
    { src: "https://www.figma.com/api/mcp/asset/3542fd32-552e-499a-bb9f-4a774d917ca4", name: `Skye – Electric Blue Custom Color • 24"`, price: "₦380,000", slug: "skye" },
    { src: "https://www.figma.com/api/mcp/asset/7aa27eab-d4f9-4213-aae1-9e8eba9f6091", name: `Tari – Honey Blonde Blunt Cut • 16"`, price: "₦245,000", slug: "tari" },
  ],
};

type Tab = "Trending" | "Bestsellers" | "Handpicked";
const tabs: Tab[] = ["Trending", "Bestsellers", "Handpicked"];

export default function TrendingSection() {
  const [activeTab, setActiveTab] = useState<Tab>("Trending");
  const [animating, setAnimating] = useState<Set<string>>(new Set());
  const { toggleItem, isLiked } = useWishlist();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const children = sectionRef.current.querySelectorAll(".trend-reveal");
    gsap.fromTo(
      Array.from(children),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", clearProps: "transform",
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true } }
    );
  }, []);

  const handleHeart = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, product: { name: string; price: string; src: string }) => {
      e.stopPropagation();
      e.preventDefault();

      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const wasLiked = isLiked(product.name);
      toggleItem(product);
      if (wasLiked) playUnlike(); else playLike();

      if (!wasLiked) {
        window.dispatchEvent(
          new CustomEvent("wishlist:heart-spawn", { detail: { x: cx, y: cy } })
        );
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

  return (
    <section ref={sectionRef} className="bg-surface py-16 lg:py-[160px] w-full overflow-hidden">
      <div className="flex flex-col gap-6 lg:gap-9 items-center w-full">
        {/* Header with tabs */}
        <div className="trend-reveal flex items-center justify-between w-full px-4 lg:px-0 lg:w-[1280px]">
          <div className="flex items-center gap-2 lg:gap-[10px] overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { playTab(); setActiveTab(tab); }}
                className={`font-cormorant italic text-[24px] lg:text-[32px] tracking-[-3px] leading-normal transition-colors cursor-pointer whitespace-nowrap ${
                  tab === activeTab ? "text-primary" : "text-muted hover:text-primary/60"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <Link href="/shop" className="flex items-center gap-2 lg:gap-4 hover:opacity-70 transition-opacity cursor-pointer shrink-0 ml-4">
            <span className="font-inter-tight text-[11px] lg:text-[16px] tracking-[2px] text-secondary leading-normal">
              SHOP ALL
            </span>
            <RightLine size={14} color="#666052" />
          </Link>
        </div>

        {/*
          Desktop: fixed-height absolute-stacked tabs
          Mobile: scrollable horizontal strip per tab
        */}
        <div className="trend-reveal relative w-full">
          {/* Desktop layout — stacked for cross-fade */}
          <div className="hidden lg:block relative w-full" style={{ height: "668px" }}>
            {tabs.map((tab) => (
              <div
                key={tab}
                className={`absolute inset-0 flex gap-1 items-start w-full transition-opacity duration-200 ${
                  tab === activeTab ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
              >
                {tabData[tab].map((product) => (
                  <Link
                    key={product.name}
                    href={`/shop/${product.slug}`}
                    className="flex flex-col items-start flex-1 min-w-0 group"
                  >
                    <div className="relative w-full h-[580px] rounded-[2px] overflow-hidden">
                      <Image src={product.src} alt={product.name} fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        unoptimized />
                      <button
                        onClick={(e) => handleHeart(e, product)}
                        aria-label={isLiked(product.name) ? "Remove from wishlist" : "Add to wishlist"}
                        className={`absolute bottom-[14px] right-[14px] size-12 rounded-full flex items-center justify-center transition-all duration-150 active:scale-[0.82] cursor-pointer ${
                          isLiked(product.name) ? "bg-black/50" : "bg-black/30 hover:bg-black/50"
                        } ${animating.has(product.name) ? "animate-heart-pop" : ""}`}
                      >
                        {isLiked(product.name) ? <HeartFill size={20} color="white" /> : <HeartLine size={20} color="white" />}
                      </button>
                    </div>
                    <div className="flex flex-col gap-2 p-4">
                      <span className="font-inter-tight text-[18px] tracking-[-1px] text-primary leading-normal">{product.name}</span>
                      <span className="font-inter-tight font-light text-[15px] tracking-[-0.3px] text-secondary leading-normal">{product.price}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Mobile layout — horizontal scroll */}
          <div className="lg:hidden overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 pl-4 pr-4" style={{ minWidth: "max-content" }}>
              {tabData[activeTab].map((product) => (
                <Link
                  key={product.name}
                  href={`/shop/${product.slug}`}
                  className="flex flex-col items-start shrink-0 w-[240px] group"
                >
                  <div className="relative w-full h-[300px] rounded-[2px] overflow-hidden">
                    <Image src={product.src} alt={product.name} fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      unoptimized />
                    <button
                      onClick={(e) => handleHeart(e, product)}
                      aria-label={isLiked(product.name) ? "Remove from wishlist" : "Add to wishlist"}
                      className={`absolute bottom-[12px] right-[12px] size-10 rounded-full flex items-center justify-center transition-all duration-150 active:scale-[0.82] cursor-pointer ${
                        isLiked(product.name) ? "bg-black/50" : "bg-black/30 hover:bg-black/50"
                      } ${animating.has(product.name) ? "animate-heart-pop" : ""}`}
                    >
                      {isLiked(product.name) ? <HeartFill size={16} color="white" /> : <HeartLine size={16} color="white" />}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 p-3">
                    <span className="font-inter-tight text-[13px] tracking-[-0.5px] text-primary leading-normal line-clamp-1">{product.name}</span>
                    <span className="font-inter-tight font-light text-[12px] text-secondary leading-normal">{product.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
