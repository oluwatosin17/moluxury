"use client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WishlistOverlay from "@/components/wishlist-overlay";
import CartOverlay from "@/components/cart-overlay";
import HeartParticleLayer from "@/components/heart-particle-layer";
import FixedSearch from "@/components/fixed-search";

const services = [
  {
    slug: "wig-styling",
    name: "Wig Styling",
    image: "https://www.figma.com/api/mcp/asset/84b5c32e-f907-44a5-a859-454fba77c57e",
  },
  {
    slug: "wig-revamping",
    name: "Wig Revamping",
    image: "https://www.figma.com/api/mcp/asset/f7efbb20-dd90-45fd-a846-fb9437fae921",
  },
  {
    slug: "wig-installation",
    name: "Wig Installation",
    image: "https://www.figma.com/api/mcp/asset/376ca829-21bd-4b0e-8b2d-0e4637cb77c5",
  },
  {
    slug: "wig-coloring",
    name: "Wig Coloring",
    image: "https://www.figma.com/api/mcp/asset/dc2930a2-4063-457c-a47f-095b8fbc3bc7",
  },
  {
    slug: "wig-maintenance",
    name: "Wig Maintenance",
    image: "https://www.figma.com/api/mcp/asset/592215e5-24e7-4f32-8afa-eda1592e7c5b",
  },
  {
    slug: "custom-consultation",
    name: "Custom Consultation",
    image: "https://www.figma.com/api/mcp/asset/55b5f586-a577-4811-9779-75abf6a3e0eb",
  },
];

export default function ServicesClient() {
  return (
    <>
      <Navbar />
      <WishlistOverlay />
      <CartOverlay />
      <HeartParticleLayer />
      <FixedSearch />

      <main className="bg-surface min-h-screen">
        {/* Header */}
        <div className="px-4 lg:px-[80px] pt-[80px] lg:pt-[80px] pb-8 lg:pb-[60px]">
          <h1 className="font-cormorant italic text-[44px] lg:text-[70px] tracking-[-3px] lg:tracking-[-6px] text-primary leading-[1.05] mb-2">
            Your Hair, Refined
          </h1>
          <p className="font-inter-tight font-light text-[14px] lg:text-[18px] text-secondary leading-normal max-w-[655px]">
            Every service is performed with precision, care, and intention. Whether you&apos;re
            installing, revamping, or reimagining your wig, our studio is designed to bring out its
            most elevated form.
          </p>
        </div>

        {/* Service card grid — 1 col mobile, 2 tablet, 3 desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="bg-surface group flex flex-col"
            >
              {/* Image */}
              <div className="relative w-full overflow-hidden rounded-[2px] h-[320px] sm:h-[420px] lg:h-[530px]">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  unoptimized
                />
              </div>

              {/* Label bar */}
              <div className="flex items-center justify-between px-[16px] py-[8px] bg-surface">
                <span className="font-cormorant italic text-[24px] tracking-[-2px] text-primary">
                  {service.name}
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-primary/60 group-hover:text-primary group-hover:translate-x-[2px] transition-all duration-200">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-[1px]">
          <Footer />
        </div>
      </main>
    </>
  );
}
