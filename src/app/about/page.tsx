import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About MoLuxury | Luxury Hair Craftsmanship & Premium Wig Experiences",
  description:
    "MoLuxury exists for the woman who knows that true beauty is intentional. Hand-finished wigs and luxury studio services designed in Lagos and worn everywhere.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About MoLuxury | Luxury Hair Craftsmanship",
    description:
      "MoLuxury exists for the woman who knows that true beauty is intentional. Handcrafted wigs and luxury services rooted in precision and personal expression.",
    url: "/about",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
};
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import WishlistOverlay from "@/components/wishlist-overlay";
import CartOverlay from "@/components/cart-overlay";
import HeartParticleLayer from "@/components/heart-particle-layer";
import FixedSearch from "@/components/fixed-search";

const heroImage = "https://www.figma.com/api/mcp/asset/cc1b90f7-2a99-448f-bd67-800976ee0505";

const bodyParagraphs = [
  "MoLuxury exists for the woman who knows that true beauty is intentional.",
  "We design handcrafted wigs and offer studio services rooted in luxury, precision, and personal expression. Every piece we create is soft in movement, precise in detail, and effortless in its finish, designed to feel like an extension of your own presence.",
  "We started in Lagos to offer an alternative to the chaotic world of social-media shopping. We replaced hidden prices and frantic direct messages with a calm, transparent, and trustworthy experience.",
  "Our curated space allows you to browse and purchase with complete confidence. Every wig is named, not numbered, because what you wear should feel personal. From texture and length to density, every detail is carefully selected and professionally finished to ensure natural movement.",
  "Beyond our custom pieces, the MoLuxury studio provides a complete care experience: professional installation, styling, revamping, custom coloring, and ongoing maintenance. Every service is handled with the same strict standard of craftsmanship.",
  "Luxury isn't about excess; it is about restraint, focus, and impeccable attention to detail.",
  "At MoLuxury, every detail is deliberate.",
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <WishlistOverlay />
      <CartOverlay />
      <HeartParticleLayer />
      <FixedSearch />

      <main className="bg-surface min-h-screen">
        <div className="flex flex-col items-center px-4 lg:px-20 pt-[100px] lg:pt-[141px] pb-[80px] lg:pb-[160px]">
          <div className="flex flex-col gap-[32px] lg:gap-[42px] w-full max-w-[520px]">

            {/* Headline */}
            <h1 className="font-cormorant italic text-[48px] lg:text-[80px] tracking-[-3px] lg:tracking-[-6px] text-primary text-center leading-[54px] lg:leading-[88px]">
              Luxury, worn effortlessly
            </h1>

            {/* Hero image */}
            <div className="relative w-full rounded-[4px] overflow-hidden" style={{ aspectRatio: "480/530" }}>
              <Image
                src={heroImage}
                alt="MoLuxury studio"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Body copy */}
            <div className="flex flex-col gap-[16px]">
              {bodyParagraphs.map((p, i) => (
                <p
                  key={i}
                  className="font-inter-tight font-light text-[16px] tracking-[-0.3px] text-secondary leading-[24px]"
                >
                  {p}
                </p>
              ))}
            </div>

          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
