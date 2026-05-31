import Image from "next/image";
import Link from "next/link";
import { assets } from "@/lib/assets";

const companyLinks = [
  { label: "New In",       href: "/shop?filter=New+in" },
  { label: "Best Sellers", href: "/shop?filter=Bestsellers" },
  { label: "Shop All",     href: "/shop" },
];
const studioLinks = [
  { label: "Book Appointment",  href: "/services/custom-consultation" },
  { label: "Wig Installation",  href: "/services/wig-installation" },
  { label: "Wig Revamping",     href: "/services/wig-revamping" },
  { label: "Wig Coloring",      href: "/services/wig-coloring" },
  { label: "Wig Maintenance",   href: "/services/wig-maintenance" },
];

const socialIcons = [
  { src: assets.socialIcon1, label: "Instagram", href: "https://www.instagram.com/moluxury._" },
  { src: assets.socialIcon2, label: "TikTok",    href: "https://www.tiktok.com/@moluxuryhairs" },
  { src: assets.socialIcon3, label: "Twitter",   href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-surface-dark flex flex-col gap-12 lg:gap-20 items-start pt-12 lg:pt-[68px] w-full">
      {/* Top row — stacks on mobile */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between px-4 lg:px-20 w-full gap-10 lg:gap-0">
        {/* Brand block */}
        <div className="flex flex-col gap-[7px] lg:w-[337px] text-white">
          <span className="font-cormorant italic text-[48px] lg:text-[64px] tracking-[-4px] leading-normal">
            MoLuxury
          </span>
          <p className="font-inter-tight font-light text-[15px] lg:text-[18px] leading-normal max-w-[320px] lg:max-w-none">
            Hand-finished wigs and luxury wig services designed in Lagos and
            worn everywhere.
          </p>
        </div>

        {/* Link columns — side by side even on mobile */}
        <div className="flex gap-8 lg:gap-[21px] items-start">
          <div className="flex flex-col gap-6 lg:gap-8 flex-1 lg:w-[157px]">
            <span className="font-inter-tight font-medium text-[12px] lg:text-[14px] tracking-[1.2px] uppercase text-white leading-[14.4px]">
              COMPANY
            </span>
            <ul className="flex flex-col gap-3 lg:gap-4">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-inter-tight font-medium text-[12px] tracking-[-0.2px] text-white/70 leading-[14.4px] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-6 lg:gap-8 flex-1 lg:w-[157px]">
            <span className="font-inter-tight font-medium text-[12px] lg:text-[14px] tracking-[1.2px] uppercase text-white leading-[14.4px]">
              Studio
            </span>
            <ul className="flex flex-col gap-3 lg:gap-4">
              {studioLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-inter-tight font-medium text-[12px] tracking-[-0.2px] text-white/70 leading-[14.4px] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#222530] px-4 lg:px-20 py-8 lg:py-[60px] w-full">
        <div className="flex items-center gap-3">
          {socialIcons.map(({ src, label, href }) => (
            <a
              key={label}
              href={href}
              target={href !== "#" ? "_blank" : undefined}
              rel={href !== "#" ? "noopener noreferrer" : undefined}
              aria-label={label}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <div className="relative size-5 rounded-[8px] overflow-hidden">
                <Image src={src} alt={label} fill className="object-contain" unoptimized />
              </div>
            </a>
          ))}
        </div>
        <span className="font-inter-tight font-light text-[10px] tracking-[1px] text-white/50 text-center uppercase leading-[15px]">
          © 2026 MOLUXURY. CRAFTED WITH HUMANIST PRECISION.
        </span>
      </div>
    </footer>
  );
}
