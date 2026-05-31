"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ArrowRightLine } from "@mingcute/react";

const signaturePieces = [
  { src: "/products/naomi-1.jpg",  name: 'Naomi – Luxury Deep Body Wave • 24"',     href: "/shop/naomi"  },
  { src: "/products/sienna-1.jpg", name: 'Sienna – Golden Balayage Straight • 22"',  href: "/shop/sienna" },
  { src: "/products/imani-1.jpg",  name: 'Imani – 22" · HD Lace Frontal',            href: "/shop/imani"  },
  { src: "/products/maya-1.jpg",   name: 'Maya – Wet & Wavy HD Frontal • 20"',       href: "/shop/maya"   },
];

export default function SignaturePiecesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = () => {
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % signaturePieces.length);
    }, 3500);
  };

  useEffect(() => {
    startAutoPlay();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goTo = (i: number) => {
    setActiveIndex(i);
    if (timerRef.current) clearInterval(timerRef.current);
    startAutoPlay();
  };

  const current = signaturePieces[activeIndex];

  return (
    <section className="bg-surface py-12 lg:py-[80px] w-full">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-20 flex flex-col lg:flex-row lg:gap-[86px] items-center justify-center gap-8">

        {/* Left: text + CTA */}
        <div className="flex flex-col gap-5 lg:gap-6 w-full lg:w-[443px] lg:shrink-0 lg:pb-[180px]">
          <div className="flex flex-col gap-2 lg:gap-[10px]">
            <h2 className="font-cormorant italic text-[36px] lg:text-[60px] tracking-[-3px] lg:tracking-[-4px] text-primary leading-normal lg:whitespace-nowrap">
              Signature Pieces
            </h2>
            <p className="font-inter-tight font-light text-[14px] lg:text-[18px] text-secondary leading-normal">
              A curated selection of our most iconic styles, defined by timeless
              texture and flawless finish.
            </p>
          </div>
          <Link
            href="/shop"
            className="self-start flex items-center gap-1 bg-surface-inverse text-white font-inter-tight font-medium text-[14px] lg:text-[16px] px-3 py-3 rounded-[24px] hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <span className="px-1">Explore pieces</span>
            <span className="size-[20px] flex items-center justify-center">
              <ArrowRightLine size={20} color="white" />
            </span>
          </Link>
        </div>

        {/* Right: cross-fade image gallery */}
        <div className="flex flex-col gap-4 lg:gap-5 items-center w-full lg:flex-1 lg:min-w-0 lg:max-w-[720px]">
          <Link
            href={current.href}
            className="relative w-full h-[400px] lg:h-[580px] rounded-[2px] overflow-hidden cursor-pointer block"
          >
            {signaturePieces.map((piece, i) => (
              <Image
                key={i}
                src={piece.src}
                alt={piece.name}
                fill
                className={`object-cover absolute inset-0 transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  i === activeIndex ? "opacity-100" : "opacity-0"
                }`}
                unoptimized
                priority={i === 0}
              />
            ))}
          </Link>

          <div className="flex items-center gap-[10px]">
            {signaturePieces.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`View image ${i + 1}`}
                className={`rounded-full transition-all duration-300 ease-out cursor-pointer ${
                  i === activeIndex
                    ? "w-7 h-[6px] bg-primary"
                    : "w-[6px] h-[6px] bg-primary/20 hover:bg-primary/45"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
