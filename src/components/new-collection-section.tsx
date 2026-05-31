"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RightLine, HeartLine, HeartFill } from "@mingcute/react";
import { useWishlist } from "@/lib/wishlist-context";
import { playLike, playUnlike } from "@/lib/sound";
import { products as allProducts } from "@/lib/products";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

interface CollectionProduct {
  src: string;
  name: string;
  price: string;
  priceNum: number;
  tag: string;
  slug: string;
}

const collectionProducts: CollectionProduct[] = [
  { src: "/products/khadijah-1.jpg", name: `Khadijah – Premium Kinky Coils • 10"`, price: "₦202,000", priceNum: 202000, tag: "NEW", slug: "khadijah" },
  { src: "/products/tara-1.jpg",     name: `Tara – Messy Pixie Curls • 12"`,       price: "₦168,000", priceNum: 168000, tag: "NEW", slug: "tara" },
  { src: "/products/zainab-1.jpg",   name: `Zainab – Wet & Wavy HD Frontal • 22"`, price: "₦272,000", priceNum: 272000, tag: "NEW", slug: "zainab" },
  { src: "/products/eniola-1.jpg",   name: `Eniola – Auburn Kinky Natural • 14"`,  price: "₦228,000", priceNum: 228000, tag: "NEW", slug: "eniola" },
  { src: "/products/nalia-1.jpg",    name: `Nalia – Deep Curl HD Frontal • 20"`,   price: "₦265,000", priceNum: 265000, tag: "NEW", slug: "nalia" },
  { src: "/products/morayo-1.jpg",   name: `Morayo – Honey Straight Gloss • 24"`,  price: "₦295,000", priceNum: 295000, tag: "NEW", slug: "morayo" },
];

export default function NewCollectionSection() {
  const [animating, setAnimating] = useState<Set<string>>(new Set());
  const { toggleItem, isLiked } = useWishlist();
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      const children = Array.from(headerRef.current.children);
      gsap.fromTo(children,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", clearProps: "transform",
          scrollTrigger: { trigger: headerRef.current, start: "top 88%", once: true } }
      );
    }
    if (cardsRef.current) {
      const cards = Array.from(cardsRef.current.querySelectorAll("a"));
      gsap.fromTo(cards,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out", clearProps: "transform",
          scrollTrigger: { trigger: cardsRef.current, start: "top 85%", once: true } }
      );
    }
  }, []);

  const handleHeart = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, product: CollectionProduct) => {
      e.stopPropagation();
      e.preventDefault();

      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const wasLiked = isLiked(product.name);
      toggleItem({ name: product.name, price: product.price, src: product.src });

      if (!wasLiked) {
        playLike();
        window.dispatchEvent(
          new CustomEvent("wishlist:heart-spawn", { detail: { x: cx, y: cy } })
        );
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

  return (
    <section className="bg-surface px-4 lg:px-20 py-16 lg:py-[120px] w-full overflow-hidden">
      <div className="flex flex-col gap-10 lg:gap-[61px] w-full">
        {/* Header */}
        <div ref={headerRef} className="w-full lg:w-[1280px]">
          {/* Mobile: stack heading → subtext → CTA | Desktop: heading+subtext left, CTA right */}
          <div className="flex flex-col gap-[7px] lg:flex-row lg:items-start lg:justify-between lg:gap-4">
            <div className="flex flex-col gap-[7px] lg:w-[443px]">
              <h2 className="font-cormorant italic text-[36px] lg:text-[60px] tracking-[-3px] lg:tracking-[-4px] text-primary leading-normal">
                The new collection
              </h2>
              <p className="font-inter-tight font-light text-[14px] lg:text-[18px] text-secondary leading-normal">
                A refined selection of new pieces designed for soft glam, bold
                presence, and everyday luxury
              </p>
              {/* CTA — shown inline below subtext on mobile only */}
              <Link href="/shop" className="flex items-center gap-2 hover:opacity-70 transition-opacity w-fit mt-1 lg:hidden">
                <span className="font-inter-tight text-[11px] tracking-[2px] text-secondary leading-normal">
                  VIEW ALL {allProducts.length} WIGS
                </span>
                <RightLine size={12} color="#666052" />
              </Link>
            </div>
            {/* CTA — desktop only, right-aligned */}
            <Link href="/shop" className="hidden lg:flex items-center gap-4 hover:opacity-70 transition-opacity shrink-0 mt-2">
              <span className="font-inter-tight text-[16px] tracking-[2px] text-secondary leading-normal">
                VIEW ALL {allProducts.length} WIGS
              </span>
              <RightLine size={14} color="#666052" />
            </Link>
          </div>
        </div>

        {/* Horizontally scrollable product cards */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 lg:-mx-20">
          <div ref={cardsRef} className="flex gap-1 items-start pl-4 lg:pl-[140px] pr-4 lg:pr-20">
            {collectionProducts.map((product) => (
              <Link
                key={product.name}
                href={`/shop/${product.slug}`}
                className="flex flex-col items-start shrink-0 w-[260px] lg:w-[430px] group cursor-pointer"
              >
                <div className="relative w-full h-[340px] lg:h-[540px] rounded-[2px] overflow-hidden">
                  <Image
                    src={product.src}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-[6px]">
                    <span className="font-inter-tight font-medium text-[10px] lg:text-[11px] tracking-[-0.2px] text-tertiary">
                      {product.tag}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleHeart(e, product)}
                    aria-label={isLiked(product.name) ? "Remove from wishlist" : "Add to wishlist"}
                    className={`absolute bottom-[12px] right-[12px] size-10 lg:size-12 rounded-full flex items-center justify-center transition-all duration-150 active:scale-[0.82] cursor-pointer ${
                      isLiked(product.name) ? "bg-black/50" : "bg-black/30 hover:bg-black/50"
                    } ${animating.has(product.name) ? "animate-heart-pop" : ""}`}
                  >
                    {isLiked(product.name) ? (
                      <HeartFill size={16} color="white" />
                    ) : (
                      <HeartLine size={16} color="white" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 lg:p-4 w-full">
                  <div className="flex flex-col gap-1 lg:gap-2 min-w-0">
                    <span className="font-inter-tight text-[13px] lg:text-[18px] tracking-[-1px] text-primary leading-normal line-clamp-1">
                      {product.name}
                    </span>
                    <span className="font-inter-tight font-light text-[12px] lg:text-[15px] tracking-[-0.3px] text-secondary leading-normal">
                      {product.price}
                    </span>
                  </div>
                  <RightLine size={14} color="#181b25" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
