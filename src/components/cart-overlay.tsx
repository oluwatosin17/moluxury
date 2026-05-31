"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { useCart, itemKey } from "@/lib/cart-context";
import { playRemove, playTab } from "@/lib/sound";

function formatPrice(num: number) {
  return `₦${num.toLocaleString("en-NG")}`;
}

/** True if the viewport is mobile-width (<= 768px) */
function isMobile() {
  return typeof window !== "undefined" && window.innerWidth <= 768;
}

export default function CartOverlay() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalItems, subtotal } = useCart();
  const isEmpty = items.length === 0;

  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef    = useRef<HTMLDivElement>(null);

  // Set initial off-screen state before first paint
  useLayoutEffect(() => {
    if (isMobile()) {
      gsap.set(panelRef.current, { y: "100%" });
    } else {
      gsap.set(panelRef.current, { x: "100%" });
    }
    gsap.set(backdropRef.current, { opacity: 0, pointerEvents: "none" });
  }, []);

  // Animate on open/close
  useEffect(() => {
    const mobile = isMobile();

    if (isOpen) {
      gsap.set(backdropRef.current, { pointerEvents: "auto" });
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.28, ease: "power2.out" });
      if (mobile) {
        gsap.to(panelRef.current, { y: "0%", duration: 0.38, ease: "power3.out" });
      } else {
        gsap.to(panelRef.current, { x: "0%", duration: 0.38, ease: "power3.out" });
      }
    } else {
      if (mobile) {
        gsap.to(panelRef.current, { y: "100%", duration: 0.32, ease: "power3.in" });
      } else {
        gsap.to(panelRef.current, { x: "100%", duration: 0.32, ease: "power3.in" });
      }
      gsap.to(backdropRef.current, {
        opacity: 0, duration: 0.28, ease: "power2.in",
        onComplete: () => gsap.set(backdropRef.current, { pointerEvents: "none" }),
      });
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, closeCart]);

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[69] bg-black/70 backdrop-blur-[15px]"
        style={{ pointerEvents: "none", opacity: 0 }}
        onClick={closeCart}
      />

      {/*
        Panel:
        Mobile  — slides up from bottom, full-width, rounded top corners, max 88dvh
        Desktop — slides in from right, fixed 480px width, inset 20px, rounded all sides
      */}
      <div
        ref={panelRef}
        className={[
          "fixed z-[70] bg-white flex flex-col overflow-hidden shadow-2xl",
          // Mobile
          "inset-x-0 bottom-0 rounded-t-[20px] max-h-[88dvh]",
          // Desktop override
          "lg:inset-x-auto lg:top-5 lg:right-5 lg:bottom-5 lg:w-[480px] lg:rounded-[16px] lg:max-h-none",
        ].join(" ")}
      >
        {/* Handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 shrink-0 lg:hidden">
          <div className="w-10 h-[4px] rounded-full bg-black/10" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 lg:pt-6 pb-5 shrink-0">
          <span className="font-cormorant italic text-[20px] tracking-[-1px] text-primary">
            Your selection ({totalItems})
          </span>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="size-8 flex items-center justify-center hover:opacity-50 transition-opacity cursor-pointer -mr-1"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3l8 8" stroke="#181b25" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {isEmpty ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 text-center pb-8">
            <div className="flex flex-col gap-4 items-center">
              <p className="font-inter-tight text-[13px] tracking-[1.5px] text-secondary/50 uppercase">
                YOUR BAG IS EMPTY
              </p>
              <p className="font-cormorant italic text-[28px] lg:text-[32px] tracking-[-2px] text-primary leading-[1.15] max-w-[300px]">
                Luxury isn&apos;t rushed. Take your time to find the piece that feels right.
              </p>
            </div>
            <Link
              href="/shop"
              onClick={closeCart}
              className="bg-[#0e121b] text-white font-inter-tight font-medium text-[14px] px-8 py-[12px] rounded-[24px] flex items-center gap-2 hover:bg-[#0e121b]/90 active:scale-[0.98] transition-all cursor-pointer"
            >
              Explore Pieces
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M8 4l5 4-5 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            {/* Scrollable items */}
            <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0 px-6 pb-4">
              <div className="flex flex-col gap-6">
                {items.map((item) => {
                  const key = itemKey(item);
                  return (
                    <div key={key} className="flex items-start justify-between h-[100px]">
                      <div className="flex gap-3 items-center h-full min-w-0 flex-1">
                        <div className="relative w-[80px] h-[100px] lg:w-[100px] rounded-[4px] overflow-hidden shrink-0">
                          <Image src={item.src} alt={item.name} fill className="object-cover" unoptimized />
                        </div>
                        <div className="flex flex-col h-full items-start justify-between py-[6px] min-w-0">
                          <div className="flex flex-col gap-[2px] min-w-0">
                            <p className="font-inter-tight text-[13px] lg:text-[14px] tracking-[-0.3px] text-primary leading-normal line-clamp-1">
                              {item.name}
                            </p>
                            <p className="font-inter-tight font-light text-[11px] lg:text-[12px] text-[#666052]">
                              {item.length} · {item.density}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { playTab(); updateQty(key, -1); }}
                              className="size-[23px] flex items-center justify-center border border-[#e1e4ea] rounded-[6px] hover:bg-surface cursor-pointer text-secondary shrink-0"
                            >
                              <svg width="9" height="2" viewBox="0 0 9 2" fill="none"><path d="M1 1h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                            </button>
                            <span className="font-inter-tight font-medium text-[12px] text-primary w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => { playTab(); updateQty(key, 1); }}
                              className="size-[24px] flex items-center justify-center border border-[#e1e4ea] rounded-[6px] hover:bg-surface cursor-pointer text-secondary shrink-0"
                            >
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between h-full py-[6px] shrink-0 pl-3">
                        <span className="font-inter-tight font-medium text-[13px] lg:text-[14px] text-primary tracking-[-0.3px]">
                          {formatPrice(item.priceNum * item.quantity)}
                        </span>
                        <button
                          onClick={() => { playRemove(); removeItem(key); }}
                          className="font-inter-tight font-light text-[12px] text-[#666052] hover:text-primary transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 lg:pb-6 pt-0 shrink-0 bg-white border-t border-[#f5f7fa]">
              <div className="flex flex-col gap-[14px] py-5 lg:py-6">
                <div className="flex items-center justify-between">
                  <span className="font-inter-tight font-light text-[13px] lg:text-[14px] tracking-[-0.3px] text-[#525866]">Shipping Costs</span>
                  <span className="font-inter-tight text-[13px] lg:text-[14px] text-primary">FREE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-inter-tight font-light text-[13px] lg:text-[14px] tracking-[-0.3px] text-[#525866]">Subtotal (tax incl.)</span>
                  <span className="font-inter-tight text-[13px] lg:text-[14px] text-primary">{formatPrice(subtotal)}</span>
                </div>
              </div>
              <div className="border-t border-dashed border-[#dddad5] pt-4 mb-5 lg:mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-inter-tight font-light text-[14px] text-[#525866]">Total</span>
                  <span className="font-inter-tight font-semibold text-[14px] text-primary">{formatPrice(subtotal)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full bg-[#0e121b] text-white font-inter-tight font-medium text-[16px] py-[12px] rounded-[24px] flex items-center justify-center gap-1 hover:bg-[#0e121b]/90 active:scale-[0.98] transition-all cursor-pointer"
              >
                Checkout
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4 11h14M11 5l6 6-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
