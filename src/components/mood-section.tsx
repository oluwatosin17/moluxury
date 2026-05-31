import Image from "next/image";
import Link from "next/link";
import { RightLine } from "@mingcute/react";
import { assets } from "@/lib/assets";

const moodProducts = [
  { src: assets.moodProduct1, label: "Body Wave",      href: "/shop?filter=Body+Wave" },
  { src: assets.moodProduct2, label: "Pixie Curl",     href: "/shop?filter=Pixie+Curl" },
  { src: assets.moodProduct3, label: "Silky Straight", href: "/shop?filter=Silky+Straight" },
];

export default function MoodSection() {
  return (
    <section className="bg-surface py-16 lg:py-[120px] w-full overflow-hidden">
      <div className="flex flex-col gap-10 lg:gap-16 items-center w-full">
        {/* Header */}
        <div className="flex items-center justify-between w-full px-4 lg:px-0 lg:w-[1280px]">
          <h2 className="font-cormorant italic text-[24px] lg:text-[32px] tracking-[-3px] text-primary leading-normal">
            Every look has a mood
          </h2>
          <span className="font-inter-tight text-[10px] lg:text-[14px] tracking-[0px] lg:tracking-[2px] text-secondary leading-normal uppercase">
            WHO YOU BECOME IN IT
          </span>
        </div>

        {/* Product cards — single col on mobile, row on desktop */}
        <div className="flex flex-col lg:flex-row gap-1 items-center w-full">
          {moodProducts.map((product) => (
            <Link
              key={product.label}
              href={product.href}
              className="flex flex-col items-start w-full lg:flex-1 lg:min-w-0 group"
            >
              <div className="relative w-full h-[320px] lg:h-[530px] rounded-[2px] overflow-hidden">
                <Image
                  src={product.src}
                  alt={product.label}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  unoptimized
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3 w-full">
                <span className="font-cormorant italic text-[20px] lg:text-[24px] tracking-[-2px] text-primary leading-normal group-hover:opacity-70 transition-opacity">
                  {product.label}
                </span>
                <RightLine size={16} color="#181b25" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
