"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ArrowRightLine } from "@mingcute/react";
import { assets } from "@/lib/assets";

export default function HeroSection() {
  const headlineRef = useRef<HTMLDivElement>(null);
  const imageRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(imageRef.current,
      { x: 60, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.9 }
    );

    if (headlineRef.current) {
      const children = headlineRef.current.querySelectorAll(":scope > *");
      tl.fromTo(
        children,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, clearProps: "transform" },
        "-=0.6"
      );
    }
  }, []);

  return (
    <section className="relative bg-surface overflow-hidden h-[620px] lg:h-[1024px] w-full">

      {/* Hero image */}
      <div
        ref={imageRef}
        className={[
          // Mobile: Figma spec — center at 50%+26px, w=520px, h=370px, top=185px
          "absolute top-[185px] -translate-x-1/2 w-[520px] h-[370px]",
          // translate compensates for the Figma left calc
          "left-[calc(50%+26px)]",
          // Desktop: original full-bleed layout
          "lg:top-[60px] lg:left-[calc(50%+220px)] lg:w-[1440px] lg:h-[1024px] lg:translate-x-[-50%]",
        ].join(" ")}
      >
        <Image
          src={assets.heroImage}
          alt="MoLuxury hero"
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>

      {/* Hero headline */}
      <div
        ref={headlineRef}
        className={[
          // Mobile: Figma spec — left 16px, top ~80px (below compact navbar), w=212px
          "absolute left-4 top-[80px] w-[212px] flex flex-col gap-4",
          // Desktop: original
          "lg:left-20 lg:top-[207px] lg:w-[489px] lg:gap-10",
        ].join(" ")}
      >
        <div className="flex flex-col gap-2">
          {/* Heading: 28px mobile → 80px desktop */}
          <h1 className="font-cormorant italic text-[28px] leading-[32px] tracking-[-1px] text-primary lg:text-[80px] lg:leading-[88px] lg:tracking-[-6px]">
            Wear luxury like it was made for you.
          </h1>
          {/* Subtitle: 12px mobile → 18px desktop */}
          <p className="font-inter-tight font-light text-[12px] text-secondary leading-normal lg:text-[18px] lg:w-[443px]">
            It&apos;s the confidence, the entrance, the attention, the softness.
            MoLuxury brings all of it together beautifully.
          </p>
        </div>

        {/* CTA: compact on mobile */}
        <Link
          href="/shop"
          className="self-start flex items-center gap-1 bg-surface-inverse text-white font-inter-tight font-medium text-[12px] px-2 py-2 rounded-[24px] hover:bg-primary/90 transition-colors lg:text-[16px] lg:px-3 lg:py-3"
        >
          <span className="px-1">Explore wigs</span>
          <span className="size-[16px] flex items-center justify-center lg:size-[22px]">
            <ArrowRightLine size={16} color="white" />
          </span>
        </Link>
      </div>
    </section>
  );
}
