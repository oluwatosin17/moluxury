"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getImageUrl } from "@/lib/supabase/utils";
import AdminTopbar from "@/components/admin/topbar";
import type { DBProduct } from "@/lib/supabase/types";

export default function AdminProducts() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    const supabase = createClient();
    supabase.from("products").select("*").order("display_order").then(({ data }) => {
      setProducts(data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "published" ? p.is_published : !p.is_published);
    return matchSearch && matchFilter;
  });

  function fmt(n: number) { return `₦${n.toLocaleString("en-NG")}`; }

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar
        title="Products"
        subtitle={`${products.length} total`}
        actions={
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-[#c9a96e] hover:bg-[#d4b87a] text-[#0e0f11] font-inter-tight font-medium text-[13px] px-4 py-2 rounded-[8px] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Add Product
          </Link>
        }
      />

      <div className="px-8 py-5 flex items-center gap-4 border-b border-[rgba(255,255,255,0.07)]">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products…"
          className="flex-1 max-w-xs bg-[#16181d] border border-[rgba(255,255,255,0.07)] rounded-[8px] px-3 py-2 font-inter-tight text-[13px] text-[#e8e4df] placeholder:text-[#888078] outline-none focus:border-[#c9a96e]/40"
        />
        <div className="flex gap-1">
          {(["all", "published", "draft"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-[6px] font-inter-tight text-[12px] capitalize transition-colors cursor-pointer ${
                filter === f ? "bg-[rgba(255,255,255,0.08)] text-[#e8e4df]" : "text-[#888078] hover:text-[#e8e4df]"
              }`}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-8 py-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-inter-tight text-[14px] text-[#888078]">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {filtered.map(p => (
              <div key={p.id} className="group bg-[#16181d] rounded-[12px] overflow-hidden border border-[rgba(255,255,255,0.05)]">
                <div className="relative aspect-[3/4] bg-[#1e2028]">
                  {p.images[0] ? (
                    <Image src={getImageUrl(p.images[0])} alt={p.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="4" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/><circle cx="12" cy="13" r="2.5" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/><path d="M4 22l7-6 4 4 3-3 9 8" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Link href={`/admin/products/${p.slug}/edit`}
                      className="bg-[#c9a96e] text-[#0e0f11] font-inter-tight text-[11px] font-medium px-3 py-1.5 rounded-full hover:bg-[#d4b87a] transition-colors"
                    >Edit</Link>
                    <a href={`/shop/${p.slug}`} target="_blank" rel="noopener noreferrer"
                      className="bg-[rgba(255,255,255,0.15)] text-white font-inter-tight text-[11px] px-3 py-1.5 rounded-full hover:bg-[rgba(255,255,255,0.25)] transition-colors"
                    >View</a>
                  </div>
                  {/* Published badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`font-inter-tight text-[10px] px-2 py-0.5 rounded-full ${
                      p.is_published ? "bg-green-500/20 text-green-400" : "bg-[rgba(255,255,255,0.1)] text-[#888078]"
                    }`}>
                      {p.is_published ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <p className="font-inter-tight text-[13px] text-[#e8e4df] truncate">{p.name}</p>
                  <p className="font-inter-tight text-[12px] text-[#c9a96e]">{fmt(p.price_naira)}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.category_slugs.slice(0, 2).map(c => (
                      <span key={c} className="font-inter-tight text-[10px] text-[#888078] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded-full capitalize">
                        {c.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
