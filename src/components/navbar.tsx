"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MenuLine, HeartLine, ShoppingBag1Line } from "@mingcute/react";
import MenuOverlay from "./menu-overlay";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { playMenuOpen, playButton } from "@/lib/sound";

export default function Navbar() {
  const [isVisible,  setIsVisible]  = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  const { items, isOpen: isWishlistOpen, openWishlist, closeWishlist } = useWishlist();
  const { openCart, totalItems: cartCount } = useCart();
  const wishlistCount = items.length;
  const prevCountRef  = useRef(wishlistCount);
  const heartBtnRef   = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 40);
      if (currentY > lastScrollY.current && currentY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (wishlistCount > prevCountRef.current && heartBtnRef.current) {
      const t = setTimeout(() => {
        if (heartBtnRef.current) {
          heartBtnRef.current.classList.add("animate-heart-nav-pulse");
          setTimeout(() => heartBtnRef.current?.classList.remove("animate-heart-nav-pulse"), 350);
        }
      }, 680);
      return () => clearTimeout(t);
    }
    prevCountRef.current = wishlistCount;
  }, [wishlistCount]);

  const navBg = isWishlistOpen
    ? "bg-transparent border-transparent shadow-none"
    : isScrolled
      ? "bg-white/95 backdrop-blur-md border-black/5 shadow-sm"
      : "bg-transparent border-white/10 backdrop-blur-[2px]";

  const iconColor  = isWishlistOpen ? "white" : "#181b25";
  const textColor  = isWishlistOpen ? "text-white" : "text-primary";
  const badgeBg    = isWishlistOpen ? "bg-white"   : "bg-primary";
  const badgeText  = isWishlistOpen ? "text-primary" : "text-white";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out border-b ${navBg} ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Mobile: px-4 py-4 | Desktop: px-20 py-6 */}
        <div className="flex items-center justify-between px-4 py-4 lg:px-20 lg:py-6">
          <button
            onClick={() => { playMenuOpen(); setIsMenuOpen(true); }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
          >
            <MenuLine size={18} color={iconColor} />
            <span className={`hidden sm:block font-inter-tight text-[10px] tracking-[2px] uppercase ${textColor} transition-colors duration-300`}>
              MENU
            </span>
          </button>

          <Link
            href="/"
            onClick={() => { if (isWishlistOpen) closeWishlist(); }}
            className={`absolute left-1/2 -translate-x-1/2 font-cormorant italic text-[24px] lg:text-[28px] tracking-[6px] uppercase select-none ${textColor} transition-colors duration-300 hover:opacity-80`}
          >
            MOLUXURY
          </Link>

          <div className="flex items-center gap-4 lg:gap-5">
            <button
              ref={heartBtnRef}
              aria-label="Wishlist"
              onClick={() => { playButton(); isWishlistOpen ? closeWishlist() : openWishlist(); }}
              className="relative hover:opacity-70 transition-opacity cursor-pointer"
            >
              <HeartLine size={18} color={iconColor} />
              {wishlistCount > 0 && (
                <span className={`absolute -top-1 -right-1 size-[14px] rounded-full ${badgeBg} flex items-center justify-center transition-colors duration-300`}>
                  <span className={`font-inter-tight font-medium text-[8px] ${badgeText} leading-none`}>
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                </span>
              )}
            </button>
            <button
              aria-label="Shopping bag"
              onClick={() => { playButton(); openCart(); }}
              className="relative hover:opacity-70 transition-opacity cursor-pointer"
            >
              <ShoppingBag1Line size={18} color={iconColor} />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1 size-[14px] rounded-full ${badgeBg} flex items-center justify-center transition-colors duration-300`}>
                  <span className={`font-inter-tight font-medium text-[8px] ${badgeText} leading-none`}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
