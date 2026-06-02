"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search2Line, ArrowLeftLine, ArrowRightLine } from "@mingcute/react";
import { playSearch, playTab } from "@/lib/sound";
import { products as catalogProducts, type FilterKey } from "@/lib/products";

interface SearchProduct {
  name: string;
  price: string;
  src: string;
  tags: string[];
  slug: string;
  type: "product";
}

interface ServiceItem {
  name: string;
  src: string;
  tags: string[];
  slug: string;
  type: "service";
}

type SearchResult = SearchProduct | ServiceItem;

const CATEGORY_TAGS: Record<FilterKey, string[]> = {
  "Body Wave":      ["body wave", "wave", "wavy", "waves"],
  "Pixie Curl":     ["pixie", "curl", "curls", "bouncy", "coil"],
  "Silky Straight": ["straight", "silk", "silky", "bone straight", "sleek"],
  "Coily Press":    ["coily", "kinky", "afro", "coils", "natural", "4c"],
  "All Pieces":     [],
  "New in":         ["new"],
  "Bestsellers":    ["bestseller", "popular"],
  "Trending":       ["trending"],
  "Handpicked":     ["handpicked"],
};

const ALL_PRODUCTS: SearchProduct[] = catalogProducts.map((p) => ({
  name:  p.name,
  price: p.price,
  src:   p.src,
  slug:  p.slug,
  type:  "product" as const,
  tags:  [...new Set(p.categories.flatMap((c) => CATEGORY_TAGS[c] ?? []))],
}));

const ALL_SERVICES: ServiceItem[] = [
  { name: "Wig Styling",         slug: "wig-styling",         src: "https://www.figma.com/api/mcp/asset/84b5c32e-f907-44a5-a859-454fba77c57e", tags: ["service","styling","style","wig","curls","waves","sleek","press"],           type: "service" },
  { name: "Wig Revamping",       slug: "wig-revamping",       src: "https://www.figma.com/api/mcp/asset/f7efbb20-dd90-45fd-a846-fb9437fae921", tags: ["service","revamping","revamp","restoration","restore","condition","detox"],  type: "service" },
  { name: "Wig Installation",    slug: "wig-installation",    src: "https://www.figma.com/api/mcp/asset/376ca829-21bd-4b0e-8b2d-0e4637cb77c5", tags: ["service","installation","install","lace","frontal","closure","natural"],     type: "service" },
  { name: "Wig Coloring",        slug: "wig-coloring",        src: "https://www.figma.com/api/mcp/asset/dc2930a2-4063-457c-a47f-095b8fbc3bc7", tags: ["service","coloring","color","colour","dye","highlights","balayage","tint"],  type: "service" },
  { name: "Wig Maintenance",     slug: "wig-maintenance",     src: "https://www.figma.com/api/mcp/asset/592215e5-24e7-4f32-8afa-eda1592e7c5b", tags: ["service","maintenance","care","condition","shampoo","clean","detangle"],    type: "service" },
  { name: "Custom Consultation", slug: "custom-consultation", src: "https://www.figma.com/api/mcp/asset/55b5f586-a577-4811-9779-75abf6a3e0eb", tags: ["service","consultation","consult","advice","recommend","guide","custom"],   type: "service" },
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
                            {isService ? "SERVICE" : (item as SearchProduct).price}
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
