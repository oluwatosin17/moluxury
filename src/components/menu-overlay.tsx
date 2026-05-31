"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { HeartLine, ShoppingBag1Line } from "@mingcute/react";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { playMenuOpen, playMenuClose, playButton } from "@/lib/sound";

const menuImages = [
  { src: "/products/imani-1.jpg",    alt: "Imani",    href: "/shop/imani"    },
  { src: "/products/naomi-1.jpg",    alt: "Naomi",    href: "/shop/naomi"    },
  { src: "/products/amara-1.jpg",    alt: "Amara",    href: "/shop/amara"    },
  { src: "/products/khadijah-1.jpg", alt: "Khadijah", href: "/shop/khadijah" },
];

const navLinks = [
  { label: "SHOP",     href: "/shop" },
  { label: "NEW IN",   href: "/shop?filter=New+in" },
  { label: "ABOUT",    href: "/about" },
  { label: "SERVICES", href: "/services" },
];

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const { items, openWishlist, closeWishlist } = useWishlist();
  const { openCart, closeCart, totalItems: cartCount } = useCart();
  const wishlistCount = items.length;

  const closeAll = () => { onClose(); closeWishlist(); closeCart(); };

  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef    = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);

  // Set initial off-screen state before first paint
  useLayoutEffect(() => {
    gsap.set(panelRef.current,    { y: "-100%" });
    gsap.set(backdropRef.current, { opacity: 0, pointerEvents: "none" });
  }, []);

  // Lock scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Open / close animation
  useEffect(() => {
    if (isOpen) {
      playMenuOpen();
      gsap.set(backdropRef.current, { pointerEvents: "auto" });
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.25, ease: "power2.out" });
      gsap.to(panelRef.current,    { y: "0%",  duration: 0.38, ease: "power3.out" });

      // Stagger nav links in
      if (contentRef.current) {
        const els = contentRef.current.querySelectorAll(".menu-item");
        gsap.fromTo(
          Array.from(els),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.28, stagger: 0.05, ease: "power2.out",
            delay: 0.18, clearProps: "transform,opacity" }
        );
      }
    } else {
      playMenuClose();
      gsap.to(panelRef.current, { y: "-100%", duration: 0.3, ease: "power3.in" });
      gsap.to(backdropRef.current, {
        opacity: 0, duration: 0.25, ease: "power2.in",
        onComplete: () => gsap.set(backdropRef.current, { pointerEvents: "none" }),
      });
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop — visible on desktop behind the panel, hidden on mobile (panel is full-screen) */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-[59] bg-black/25 hidden lg:block"
        style={{ opacity: 0, pointerEvents: "none" }}
        onClick={onClose}
      />

      {/*
        Panel
        Mobile  → full-screen (inset-0), flex-col, slides down from top
        Desktop → auto-height (bottom: auto), same slide-down
      */}
      <div
        ref={panelRef}
        className="fixed top-0 left-0 right-0 z-[60] bg-white flex flex-col bottom-0 lg:bottom-auto"
      >
        {/* ── Shared inner wrapper ────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-h-0 px-4 lg:px-20">

          {/* Top bar */}
          <div className="flex items-center justify-between py-4 lg:py-6 relative shrink-0">
            <button
              onClick={() => { playMenuClose(); onClose(); }}
              className="flex items-center gap-2 cursor-pointer hover:opacity-60 transition-opacity"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="#181b25" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:block font-inter-tight text-[10px] tracking-[2px] uppercase text-primary">
                MENU
              </span>
            </button>

            <Link href="/" onClick={closeAll}
              className="absolute left-1/2 -translate-x-1/2 font-cormorant italic text-[24px] lg:text-[28px] tracking-[6px] uppercase text-primary select-none hover:opacity-80">
              MOLUXURY
            </Link>

            <div className="flex items-center gap-4 lg:gap-5">
              <button aria-label="Wishlist"
                onClick={() => { playButton(); onClose(); setTimeout(openWishlist, 300); }}
                className="relative hover:opacity-60 transition-opacity cursor-pointer">
                <HeartLine size={18} color="#181b25" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-[14px] rounded-full bg-primary flex items-center justify-center">
                    <span className="font-inter-tight font-medium text-[8px] text-white leading-none">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  </span>
                )}
              </button>
              <button aria-label="Shopping bag"
                onClick={() => { playButton(); onClose(); setTimeout(openCart, 300); }}
                className="relative hover:opacity-60 transition-opacity cursor-pointer">
                <ShoppingBag1Line size={18} color="#181b25" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-[14px] rounded-full bg-primary flex items-center justify-center">
                    <span className="font-inter-tight font-medium text-[8px] text-white leading-none">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── Content area ─────────────────────────────────────── */}
          <div
            ref={contentRef}
            className="flex flex-col flex-1 min-h-0 gap-6 pb-4 lg:flex-row lg:items-start lg:mt-4 lg:pb-10 lg:gap-0"
          >

            {/* ── Nav links ──────────────────────────────────────── */}
            <div className="shrink-0 relative lg:w-[325px] lg:h-[260px]">
              <nav className="flex flex-col gap-[14px] lg:gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={closeAll}
                    className="menu-item font-inter-tight font-light text-[15px] lg:text-[14px] tracking-[-0.2px] text-primary hover:opacity-50 transition-opacity cursor-pointer w-fit"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Copyright — desktop only */}
              <p className="hidden lg:block absolute bottom-0 font-inter-tight font-light text-[10px] tracking-[-0.2px] text-tertiary">
                © 2026 MOLUXURY. CRAFTED WITH HUMANIST PRECISION.
              </p>
            </div>

            {/* ── Desktop images (4 tall thumbnails, side by side) ── */}
            <div className="hidden lg:flex ml-auto gap-[4px]">
              {menuImages.map((img) => (
                <Link
                  key={img.alt}
                  href={img.href}
                  onClick={() => { playButton(); closeAll(); }}
                  className="relative w-[220px] h-[260px] rounded-[4px] overflow-hidden shrink-0 group cursor-pointer"
                >
                  <Image src={img.src} alt={img.alt} fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    unoptimized />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 rounded-[4px]" />
                </Link>
              ))}
            </div>

            {/* ── Mobile images — fills remaining height ─────────── */}
            {/*
              Separator line between nav section and images.
              Image section grows to fill all remaining vertical space.
              Two rows, each row contains two equal-width images.
            */}
            <div className="flex-1 min-h-0 flex flex-col gap-1 lg:hidden">
              {/* Separator */}
              <div className="w-full h-px bg-black/8 mb-2 shrink-0" />

              {/* Row 1 */}
              <div className="flex flex-1 min-h-0 gap-1">
                {menuImages.slice(0, 2).map((img) => (
                  <Link
                    key={img.alt}
                    href={img.href}
                    onClick={() => { playButton(); closeAll(); }}
                    className="menu-item relative flex-1 min-h-0 rounded-[4px] overflow-hidden group cursor-pointer"
                  >
                    <Image src={img.src} alt={img.alt} fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      unoptimized />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                      <span className="font-inter-tight text-[11px] font-medium text-white tracking-[0.5px]">
                        {img.alt}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Row 2 */}
              <div className="flex flex-1 min-h-0 gap-1">
                {menuImages.slice(2).map((img) => (
                  <Link
                    key={img.alt}
                    href={img.href}
                    onClick={() => { playButton(); closeAll(); }}
                    className="menu-item relative flex-1 min-h-0 rounded-[4px] overflow-hidden group cursor-pointer"
                  >
                    <Image src={img.src} alt={img.alt} fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      unoptimized />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                      <span className="font-inter-tight text-[11px] font-medium text-white tracking-[0.5px]">
                        {img.alt}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>{/* /content */}

          {/* Mobile copyright */}
          <p className="lg:hidden shrink-0 font-inter-tight font-light text-[10px] tracking-[-0.2px] text-tertiary pb-5">
            © 2026 MOLUXURY. CRAFTED WITH HUMANIST PRECISION.
          </p>

        </div>{/* /inner */}
      </div>{/* /panel */}
    </>
  );
}
