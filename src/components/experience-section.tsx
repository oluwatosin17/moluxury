"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RightLine } from "@mingcute/react";

const experiences = [
  {
    slug: "wig-styling",
    thumbnail: "https://www.figma.com/api/mcp/asset/b1f58ca8-f0d4-4607-852c-e64f359edd85",
    image: "https://www.figma.com/api/mcp/asset/3c5d1835-d270-450c-b91f-596e1bde2e23",
    title: "Wig Styling",
    description: "Curls, waves, sleek press, fitted to your event and finished by hand",
  },
  {
    slug: "wig-revamping",
    thumbnail: "https://www.figma.com/api/mcp/asset/79ac3a2c-079d-40ca-ba69-769cdd96d2b6",
    image: "https://www.figma.com/api/mcp/asset/4f9e45ed-15ed-4bbf-b860-953bdbcadf16",
    title: "Wig Revamping",
    description:
      "A complete restoration for worn wigs through deep cleansing, conditioning, and restyling that restores softness, movement, and life.",
  },
  {
    slug: "wig-installation",
    thumbnail: "https://www.figma.com/api/mcp/asset/852ada40-8080-4f79-9f1b-ad3589e2cb32",
    image: "https://www.figma.com/api/mcp/asset/b46c4342-1158-417f-a2fb-ed40055c4e31",
    title: "Wig Installation",
    description:
      "Seamless lace installation with precise blending, melt finishing, and styling for a natural and undetectable look",
  },
  {
    slug: "wig-coloring",
    thumbnail: "https://www.figma.com/api/mcp/asset/5843cf6a-c7f6-4f99-bf9d-4fc55be4032f",
    image: "https://www.figma.com/api/mcp/asset/313f280b-bf2c-41c7-8f32-3e5f917b48f6",
    title: "Wig Coloring",
    description:
      "Custom colour work tailored to your vision, from subtle tones to bold transformations that enhance texture and depth.",
  },
];

export default function ExperienceSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const current = experiences[activeIndex];

  return (
    <section className="bg-surface flex flex-col gap-6 lg:gap-[30px] items-center w-full overflow-hidden">
      {/* Top: heading LEFT, thumbnails RIGHT — stacks on mobile */}
      <div className="flex flex-col lg:flex-row lg:gap-[34px] lg:items-center w-full lg:pr-20 gap-4">
        {/* Left: title */}
        <div className="flex flex-col items-start px-4 lg:px-20 lg:flex-1 lg:min-w-0">
          <h2 className="font-cormorant italic text-[32px] lg:text-[60px] tracking-[-3px] lg:tracking-[-4px] text-primary leading-normal lg:whitespace-nowrap">
            The luxury experience
          </h2>
        </div>

        {/* Thumbnails */}
        <div className="flex items-center gap-2 shrink-0 px-4 lg:px-0 overflow-x-auto scrollbar-hide">
          {experiences.map((exp, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Select ${exp.title}`}
              className="relative w-[52px] h-[58px] lg:w-[60px] lg:h-[67px] rounded-[4px] overflow-hidden shrink-0 cursor-pointer"
            >
              <Image src={exp.thumbnail} alt={exp.title} fill className="object-cover" unoptimized />
              <div
                className={`absolute inset-0 transition-opacity duration-200 ${
                  i === activeIndex ? "bg-transparent" : "bg-white/30 hover:bg-white/10"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main image */}
      <div className="flex flex-col gap-4 lg:gap-[26px] items-start w-full">
        <div className="relative w-full h-[280px] lg:h-[440px] overflow-hidden">
          {experiences.map((exp, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-300 ${
                i === activeIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image src={exp.image} alt={exp.title} fill className="object-cover" unoptimized priority={i === 0} />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-4 lg:px-20 w-full">
          <div className="flex flex-col gap-1 lg:gap-2 flex-1 min-w-0 pr-4">
            <span className="font-inter-tight text-[16px] lg:text-[20px] tracking-[-1px] text-primary leading-normal">
              {current.title}
            </span>
            <span className="font-inter-tight font-light text-[13px] lg:text-[18px] tracking-[-0.1px] text-secondary leading-normal lg:max-w-[580px]">
              {current.description}
            </span>
          </div>
          <Link href={`/services/${current.slug}`} className="flex items-center gap-2 lg:gap-4 hover:opacity-70 transition-opacity cursor-pointer shrink-0">
            <span className="font-inter-tight text-[12px] lg:text-[16px] tracking-[2px] text-secondary leading-normal">
              VIEW
            </span>
            <RightLine size={14} color="#525866" />
          </Link>
        </div>
      </div>
    </section>
  );
}
