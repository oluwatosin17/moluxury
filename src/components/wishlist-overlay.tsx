"use client";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartFill } from "@mingcute/react";
import { useWishlist } from "@/lib/wishlist-context";

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M12 4L4 12M4 4l8 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function WishlistOverlay() {
  const { items, isOpen, closeWishlist, toggleItem } = useWishlist();
  const count = items.length;
  const isEmpty = count === 0;

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeWishlist(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, closeWishlist]);

  return (
    <div
      className={`fixed inset-0 z-[49] flex flex-col transition-opacity duration-300 ease-out ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{ background: "#111110" }}
    >
      {/* Label — px-4 mobile, px-20 desktop */}
      <div className="px-4 lg:px-20 shrink-0" style={{ paddingTop: "72px" }}>
        <span className="font-inter-tight font-light text-[10px] tracking-[3px] uppercase text-white/40">
          MY WISHLIST ({count})
        </span>
      </div>

      {isEmpty ? (
        <>
          <div className="flex-1 flex flex-col items-center justify-center px-4 lg:px-20 text-center gap-4 pb-[100px]">
            <p className="font-inter-tight text-[14px] lg:text-[16px] tracking-[-0.2px] text-white leading-normal">
              Your wishlist is empty
            </p>
            <h2 className="font-cormorant italic text-[36px] lg:text-[56px] tracking-[-3px] text-white leading-tight max-w-[628px]">
              Beauty begins with the details you choose to keep, the ones that make you feel most confident, effortless, and beautifully yourself.
            </h2>
          </div>

          <div className="flex items-center justify-center pb-12 lg:pb-16 shrink-0">
            <div className="flex items-center p-[9px] rounded-full border border-white/15 backdrop-blur-sm bg-white/5">
              <Link
                href="/shop"
                onClick={closeWishlist}
                className="h-[46px] w-[140px] lg:w-[159px] bg-white rounded-full font-inter-tight font-medium text-[13px] lg:text-[14px] text-primary flex items-center justify-center hover:bg-white/90 transition-colors cursor-pointer shrink-0"
              >
                Explore Pieces
              </Link>
              <button
                onClick={closeWishlist}
                aria-label="Close wishlist"
                className="size-12 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-[9px]"
              >
                <XIcon />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Scrollable product grid — 2 cols on mobile, 3 on desktop */}
          <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0 px-4 lg:px-20 mt-8 lg:mt-[56px]">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-[8px] lg:gap-[13px] pb-8">
              {items.map((item) => {
                const slug = item.name.split(/\s*[–\-]\s*/)[0].toLowerCase().trim();
                return (
                  <Link
                    key={item.name}
                    href={`/shop/${slug}`}
                    onClick={closeWishlist}
                    className="flex flex-col group"
                  >
                    <div className="relative h-[240px] sm:h-[360px] lg:h-[580px] rounded-[2px] overflow-hidden">
                      <Image
                        src={item.src}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        unoptimized
                      />
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleItem(item); }}
                        aria-label="Remove from wishlist"
                        className="absolute bottom-[10px] right-[10px] size-10 lg:size-12 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50 transition-colors cursor-pointer"
                      >
                        <HeartFill size={16} color="white" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1 lg:gap-2 pt-3 lg:pt-4 pb-2">
                      <span className="font-inter-tight text-[13px] lg:text-[16px] tracking-[-0.5px] text-white leading-normal line-clamp-1">
                        {item.name}
                      </span>
                      <span className="font-inter-tight font-light text-[12px] lg:text-[14px] text-white/50 leading-normal">
                        {item.price}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom pill */}
          <div className="flex items-center justify-center pb-10 lg:pb-16 shrink-0 pt-4">
            <div className="p-[9px] rounded-full border border-white/15 backdrop-blur-sm bg-white/5">
              <button
                onClick={closeWishlist}
                aria-label="Close wishlist"
                className="size-12 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
              >
                <XIcon />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
