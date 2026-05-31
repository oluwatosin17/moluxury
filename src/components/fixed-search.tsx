"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search2Line, ArrowLeftLine, ArrowRightLine } from "@mingcute/react";
import { playSearch, playTab, playButton } from "@/lib/sound";

interface Product {
  name: string;
  price: string;
  src: string;
  tags: string[];
  slug: string;
  type?: "product";
}

interface ServiceItem {
  name: string;
  src: string;
  tags: string[];
  slug: string;
  type: "service";
}

type SearchResult = (Product & { type: "product" }) | ServiceItem;

const ALL_SERVICES: ServiceItem[] = [
  { name: "Wig Styling",         slug: "wig-styling",         src: "https://www.figma.com/api/mcp/asset/84b5c32e-f907-44a5-a859-454fba77c57e", tags: ["service","styling","style","wig","curls","waves","sleek","press"],           type: "service" },
  { name: "Wig Revamping",       slug: "wig-revamping",       src: "https://www.figma.com/api/mcp/asset/f7efbb20-dd90-45fd-a846-fb9437fae921", tags: ["service","revamping","revamp","restoration","restore","condition","detox"],  type: "service" },
  { name: "Wig Installation",    slug: "wig-installation",    src: "https://www.figma.com/api/mcp/asset/376ca829-21bd-4b0e-8b2d-0e4637cb77c5", tags: ["service","installation","install","lace","frontal","closure","natural"],     type: "service" },
  { name: "Wig Coloring",        slug: "wig-coloring",        src: "https://www.figma.com/api/mcp/asset/dc2930a2-4063-457c-a47f-095b8fbc3bc7", tags: ["service","coloring","color","colour","dye","highlights","balayage","tint"],  type: "service" },
  { name: "Wig Maintenance",     slug: "wig-maintenance",     src: "https://www.figma.com/api/mcp/asset/592215e5-24e7-4f32-8afa-eda1592e7c5b", tags: ["service","maintenance","care","condition","shampoo","clean","detangle"],    type: "service" },
  { name: "Custom Consultation", slug: "custom-consultation", src: "https://www.figma.com/api/mcp/asset/55b5f586-a577-4811-9779-75abf6a3e0eb", tags: ["service","consultation","consult","advice","recommend","guide","custom"],   type: "service" },
];

const ALL_PRODUCTS: Product[] = [
  { name: `Bodie – Silk Straight Bob • 12"`,        price: "₦235,000", src: "/products/bodie-1.jpg",   tags: ["straight","bob","silk","bodie"],         slug: "bodie" },
  { name: `Imani - 22" · HD Lace`,                  price: "₦346,000", src: "/products/imani-1.jpg",   tags: ["hd lace","straight","imani"],             slug: "imani" },
  { name: `Camille - Hand-finished body wave · 24"`, price: "₦186,000", src: "/products/camille-1.jpg", tags: ["body wave","wave","camille"],             slug: "camille" },
  { name: `Zoe - Polished straight finish · 26"`,    price: "₦326,000", src: "https://www.figma.com/api/mcp/asset/0cc450b1-6ca1-4837-8250-3f95f340eff3", tags: ["straight","zoe"],                        slug: "zoe" },
  { name: `Amara – Honey Highlighted Wave • 20"`,    price: "₦295,000", src: "/products/amara-1.jpg",   tags: ["wave","honey","highlighted","amara"],     slug: "amara" },
  { name: `Kiki – Bouncy Volumizing Curls • 14"`,    price: "₦195,000", src: "https://www.figma.com/api/mcp/asset/fcc754b7-1986-4693-bcdc-266f0bc3d791", tags: ["curls","curl","bouncy","kiki"],           slug: "kiki" },
  { name: `Naomi – Luxury Deep Body Wave • 24"`,     price: "₦385,000", src: "/products/naomi-1.jpg",   tags: ["body wave","deep","naomi","luxury"],      slug: "naomi" },
  { name: `Sienna – Golden Balayage Straight • 22"`, price: "₦315,000", src: "/products/sienna-1.jpg",  tags: ["straight","balayage","golden","sienna"],  slug: "sienna" },
  { name: `Maya – Wet & Wavy HD Frontal • 20"`,      price: "₦285,000", src: "/products/maya-1.jpg",    tags: ["wavy","wet","hd","frontal","maya"],       slug: "maya" },
  { name: `Zuri – Premium Afro Kinky Coils • 18"`,   price: "₦260,000", src: "/products/zuri-1.jpg",    tags: ["afro","kinky","coils","curl","zuri"],     slug: "zuri" },
  { name: `Skye – Electric Blue Custom Color • 24"`, price: "₦380,000", src: "https://www.figma.com/api/mcp/asset/3542fd32-552e-499a-bb9f-4a774d917ca4", tags: ["color","blue","custom","skye"],           slug: "skye" },
  { name: `Tari – Honey Blonde Blunt Cut • 16"`,     price: "₦245,000", src: "https://www.figma.com/api/mcp/asset/7aa27eab-d4f9-4213-aae1-9e8eba9f6091", tags: ["blonde","blunt","straight","tari"],       slug: "tari" },
  { name: `Diana – 24" Body Wave`,                   price: "₦186,000", src: "https://www.figma.com/api/mcp/asset/ad00e341-3b56-4b43-82df-1ef288d9ac02", tags: ["body wave","wave","diana"],               slug: "shop" },
  { name: `Aria – 26" Deep Curl`,                    price: "₦215,000", src: "https://www.figma.com/api/mcp/asset/775b2cf4-b765-4a52-9393-37df904496de", tags: ["curl","deep","aria"],                     slug: "shop" },
  { name: `Vera – 22" Straight HD Lace`,             price: "₦172,000", src: "https://www.figma.com/api/mcp/asset/f09eda4a-2188-470e-8c3a-ec0c8a58955b", tags: ["straight","hd lace","vera"],             slug: "shop" },
  { name: `Khadijah – Premium Kinky Coils • 10"`,   price: "₦202,000", src: "/products/khadijah-1.jpg",  tags: ["kinky","coils","coily","khadijah"],       slug: "khadijah" },
  { name: `Tara – Messy Pixie Curls • 12"`,         price: "₦168,000", src: "/products/tara-1.jpg",      tags: ["pixie","curl","messy","tara"],            slug: "tara" },
  { name: `Zainab – Wet & Wavy HD Frontal • 22"`,   price: "₦272,000", src: "/products/zainab-1.jpg",    tags: ["wavy","wet","hd","frontal","zainab"],     slug: "zainab" },
  { name: `Eniola – Auburn Kinky Natural • 14"`,    price: "₦228,000", src: "/products/eniola-1.jpg",    tags: ["kinky","auburn","natural","coily","eniola"], slug: "eniola" },
  { name: `Nalia – Deep Curl HD Frontal • 20"`,     price: "₦265,000", src: "/products/nalia-1.jpg",     tags: ["curl","deep","hd","frontal","nalia"],     slug: "nalia" },
  { name: `Morayo – Honey Straight Gloss • 24"`,    price: "₦295,000", src: "/products/morayo-1.jpg",    tags: ["straight","honey","gloss","morayo"],      slug: "morayo" },
];

const PER_PAGE = 4;

export default function FixedSearch() {
  const [query, setQuery]         = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [page, setPage]           = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim().toLowerCase();
  const results: SearchResult[] = trimmed
    ? [
        ...ALL_PRODUCTS.filter(
          (p) => p.name.toLowerCase().includes(trimmed) || p.tags.some((t) => t.includes(trimmed))
        ).map((p) => ({ ...p, type: "product" as const })),
        ...ALL_SERVICES.filter(
          (s) => s.name.toLowerCase().includes(trimmed) || s.tags.some((t) => t.includes(trimmed))
        ),
      ]
    : [];
  const totalPages  = Math.ceil(results.length / PER_PAGE);
  const pageResults = results.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const showPanel   = isFocused && trimmed.length > 0;

  const handleChange = (val: string) => {
    setQuery(val);
    setPage(0);
  };

  const handleClear = () => {
    setQuery("");
    setPage(0);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-32px)] max-w-[600px]">

      {/* ── Results panel — always in DOM for smooth enter/exit animation ── */}
      <div
        className={`absolute bottom-full mb-3 w-full transition-all duration-300 ease-out origin-bottom
          ${showPanel
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-3 scale-[0.98] pointer-events-none"
          }`}
        onMouseDown={(e) => e.preventDefault()}
      >
        <div className="bg-black/70 backdrop-blur-md rounded-[24px] flex flex-col" style={{ maxHeight: 'min(calc(100dvh - 160px), 520px)' }}>

          {/* Header — always visible, never scrolls */}
          <div className="flex items-center justify-between px-5 pt-5 pb-0 shrink-0">
            <span className="font-inter-tight font-medium text-[12px] tracking-[2.4px] uppercase text-white select-none">
              RESULTS
            </span>
            <button
              onClick={handleClear}
              aria-label="Clear search"
              className="flex items-center justify-center p-3 -m-3 cursor-pointer group"
            >
              <span className="h-[2px] w-4 bg-white/60 group-hover:bg-white transition-colors rounded-full" />
            </button>
          </div>

          {/* Scrollable body — grows to fill available space */}
          <div className="flex flex-col gap-6 px-5 pt-6 pb-5 overflow-y-auto min-h-0 scrollbar-hide">

            {results.length > 0 ? (
              <>
                {/* Single-row image grid — fixed-width cards */}
                <div className="flex gap-[4px] h-[180px] md:h-[260px]">
                  {pageResults.map((item) => {
                    const isService = item.type === "service";
                    const href = isService
                      ? `/services/${item.slug}`
                      : item.slug === "shop" ? "/shop" : `/shop/${item.slug}`;
                    return (
                      <Link
                        key={item.name}
                        href={href}
                        className={`relative rounded-[2px] overflow-hidden group cursor-pointer ${
                          pageResults.length === 4 ? "flex-1" : "w-[130px] shrink-0"
                        }`}
                      >
                        <Image
                          src={item.src}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                          unoptimized
                        />
                        {/* Name / price/label gradient overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 pt-8 pb-3 pointer-events-none">
                          <p className="font-inter-tight text-[11px] leading-snug text-white line-clamp-2">
                            {item.name}
                          </p>
                          <p className="font-inter-tight font-light text-[10px] mt-[2px] text-white/60">
                            {isService ? "SERVICE" : (item as Product).price}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-2">
                    <button
                      onClick={() => { playTab(); setPage((p) => Math.max(0, p - 1)); }}
                      disabled={page === 0}
                      className="size-10 rounded-full border border-white/30 flex items-center justify-center hover:border-white/60 transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowLeftLine size={16} color="white" />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={`rounded-full transition-all duration-200 cursor-pointer ${
                            i === page ? "size-[6px] bg-white" : "size-[6px] bg-white/40 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => { playTab(); setPage((p) => Math.min(totalPages - 1, p + 1)); }}
                      disabled={page === totalPages - 1}
                      className="size-10 rounded-full border border-white/30 flex items-center justify-center hover:border-white/60 transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowRightLine size={16} color="white" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* ── Empty state ── */
              <div className="flex flex-col gap-6 pb-[30px]">
                <div className="flex flex-col gap-[7px]">
                  <h3 className="font-cormorant italic text-[36px] md:text-[60px] tracking-[-4px] text-white leading-none">
                    No result found
                  </h3>
                  <p className="font-inter-tight font-light text-[14px] md:text-[18px] text-white leading-normal">
                    We couldn&apos;t find any matches for your search. Try adjusting
                    your filters or explore our latest arrivals.
                  </p>
                </div>
                <button className="self-start bg-white font-inter-tight font-medium text-[16px] text-primary px-3 py-3 rounded-[24px] hover:bg-white/90 transition-colors cursor-pointer">
                  <span className="px-1">Explore wigs</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Search pill ─────────────────────────────────────────────────── */}
      <div className="flex items-center backdrop-blur-[6px] bg-black/70 border border-white/10 rounded-full pl-6 pr-[9px] py-[9px]">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { setIsFocused(true); playSearch(); }}
          onBlur={() => setIsFocused(false)}
          placeholder="Search wigs, textures, lengths"
          className="flex-1 px-2 py-[10px] bg-transparent outline-none font-inter-tight text-[16px] text-white placeholder:text-white/40 leading-normal"
        />
        <button className="size-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 hover:bg-white/20 transition-colors cursor-pointer">
          <Search2Line size={20} color="white" />
        </button>
      </div>

    </div>
  );
}
