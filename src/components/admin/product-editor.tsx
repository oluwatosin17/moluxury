"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ImageUploader from "./image-uploader";
import type { DBProduct, Category } from "@/lib/supabase/types";

interface ProductEditorProps {
  product?: DBProduct;       // undefined = new product
  categories: Category[];
}

const DEFAULT_LENGTHS = [`18"`, `20"`, `22"`, `24"`, `26"`, `28"`];
const DEFAULT_DENSITIES = ["150%", "180%", "200%", "250%"];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function fmtPrice(n: number) {
  if (!n) return "";
  return `₦${n.toLocaleString("en-NG")}`;
}

export default function ProductEditor({ product, categories }: ProductEditorProps) {
  const router = useRouter();
  const isNew = !product;

  const [name, setName]               = useState(product?.name ?? "");
  const [slug, setSlug]               = useState(product?.slug ?? "");
  const [slugManual, setSlugManual]   = useState(false);
  const [price, setPrice]             = useState<number | "">(product?.price_naira ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [images, setImages]           = useState<string[]>(product?.images ?? []);
  const [cats, setCats]               = useState<string[]>(product?.category_slugs ?? []);
  const [lengths, setLengths]         = useState<string[]>(product?.available_lengths ?? DEFAULT_LENGTHS);
  const [densities, setDensities]     = useState<string[]>(product?.available_densities ?? DEFAULT_DENSITIES);
  const [customLengthInput, setCustomLengthInput]   = useState("");
  const [customDensityInput, setCustomDensityInput] = useState("");
  const [texture, setTexture]         = useState(product?.texture ?? "");
  const [capType, setCapType]         = useState(product?.cap_type ?? "HD Transparent Lace");
  const [origin, setOrigin]           = useState(product?.origin ?? "100% Virgin Human Hair");
  const [published, setPublished]     = useState(product?.is_published ?? true);
  const [slugExists, setSlugExists]   = useState(false);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://moluxury.vercel.app";

  // Auto-generate slug from name when new product
  useEffect(() => {
    if (!slugManual && isNew) setSlug(slugify(name));
  }, [name, slugManual, isNew]);

  // Check slug uniqueness
  useEffect(() => {
    if (!slug || (!isNew && slug === product?.slug)) { setSlugExists(false); return; }
    const t = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("id").eq("slug", slug).single();
      setSlugExists(!!data && (isNew || data.id !== product?.id));
    }, 400);
    return () => clearTimeout(t);
  }, [slug, isNew, product?.id, product?.slug]);

  function toggleCat(catSlug: string) {
    setCats(prev => prev.includes(catSlug) ? prev.filter(c => c !== catSlug) : [...prev, catSlug]);
  }
  function toggleLength(l: string) {
    setLengths(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  }
  function toggleDensity(d: string) {
    setDensities(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }
  function addCustomLength() {
    const v = customLengthInput.trim();
    if (!v || lengths.includes(v)) { setCustomLengthInput(""); return; }
    setLengths(prev => [...prev, v]);
    setCustomLengthInput("");
  }
  function addCustomDensity() {
    const v = customDensityInput.trim();
    if (!v || densities.includes(v)) { setCustomDensityInput(""); return; }
    setDensities(prev => [...prev, v]);
    setCustomDensityInput("");
  }

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }

  // `save` always uses the `published` state — the toggle is the sole authority.
  // An optional `forcePublish` lets the "Save & Publish" shortcut override it once.
  async function save(forcePublish?: boolean) {
    if (!name || !slug || !price || slugExists) return;
    setSaving(true);

    const publishValue = forcePublish !== undefined ? forcePublish : published;
    // Keep the toggle in sync with what we're actually writing
    setPublished(publishValue);

    const payload = {
      slug,
      name,
      price_naira: Number(price),
      description,
      images,
      category_slugs: cats,
      available_lengths: lengths,
      available_densities: densities,
      texture,
      cap_type: capType,
      origin,
      is_published: publishValue,
    };

    const res = isNew
      ? await fetch("/api/admin/product", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/product", { method: "PUT",  headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: product!.id, ...payload }) });

    const json = await res.json();
    if (!res.ok) { showToast(json.error ?? "Save failed", false); setSaving(false); return; }

    // Revalidate live site cache
    try {
      await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}&slug=${slug}`, { method: "POST" });
    } catch { /* non-fatal */ }

    showToast(publishValue ? "Product published. Live site updated." : "Saved as draft — hidden from storefront.");
    setSaving(false);
    if (isNew) router.push(`/admin/products/${json.product.slug}/edit`);
  }

  async function deleteProduct() {
    if (!product) return;
    const confirmed = window.confirm(
      `Delete ${product.name}?\n\nThis will permanently remove the product. This cannot be undone.`
    );
    if (!confirmed) return;
    const res = await fetch(`/api/admin/product?id=${product.id}`, { method: "DELETE" });
    if (!res.ok) { const j = await res.json(); showToast(j.error ?? "Delete failed", false); return; }
    await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}&slug=${product.slug}`, { method: "POST" });
    router.push("/admin/products");
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-[10px] font-inter-tight text-[13px] shadow-xl transition-all ${
          toast.ok ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-8 py-8 space-y-10">

        {/* Section 1 — Core Info */}
        <section className="space-y-5">
          <h2 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">
            Core Info
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078]">Product Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='e.g. "HD Lace 22""'
                className="w-full bg-[#16181d] border border-[rgba(255,255,255,0.07)] focus:border-[#c9a96e]/50 rounded-[8px] px-4 py-3 font-inter-tight text-[14px] text-[#e8e4df] placeholder:text-[#888078] outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078]">Slug</label>
              <input
                value={slug}
                onChange={e => { setSlug(slugify(e.target.value)); setSlugManual(true); }}
                placeholder="e.g. hd-lace-22"
                className={`w-full bg-[#16181d] border rounded-[8px] px-4 py-3 font-mono text-[13px] outline-none transition-colors ${
                  slugExists ? "border-red-500/50 text-red-400" : "border-[rgba(255,255,255,0.07)] focus:border-[#c9a96e]/50 text-[#e8e4df]"
                }`}
              />
              <p className="font-inter-tight text-[11px] text-[#888078]">
                {slugExists ? (
                  <span className="text-red-400">Slug already in use</span>
                ) : slug ? (
                  <span>{baseUrl}/shop/<span className="text-[#c9a96e]">{slug}</span></span>
                ) : null}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078]">Price (₦)</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value ? Number(e.target.value) : "")}
                placeholder="e.g. 346000"
                className="w-full bg-[#16181d] border border-[rgba(255,255,255,0.07)] focus:border-[#c9a96e]/50 rounded-[8px] px-4 py-3 font-inter-tight text-[14px] text-[#e8e4df] placeholder:text-[#888078] outline-none transition-colors"
              />
              {price ? <p className="font-inter-tight text-[11px] text-[#c9a96e]">{fmtPrice(Number(price))}</p> : null}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPublished(p => !p)}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${published ? "bg-[#c9a96e]" : "bg-[rgba(255,255,255,0.1)]"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${published ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="font-inter-tight text-[13px] text-[#e8e4df]">
              {published ? "Published — visible on storefront" : "Draft — hidden from storefront"}
            </span>
          </div>
        </section>

        {/* Section 2 — Description */}
        <section className="space-y-4">
          <h2 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">Description</h2>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={5}
            placeholder="Write in MoLuxury's voice — literary, one paragraph, no adjective excess."
            className="w-full bg-[#16181d] border border-[rgba(255,255,255,0.07)] focus:border-[#c9a96e]/50 rounded-[8px] px-4 py-3 font-inter-tight text-[14px] text-[#e8e4df] placeholder:text-[#888078] outline-none transition-colors resize-none"
          />
          <p className="font-inter-tight text-[11px] text-[#888078]">{description.length} characters</p>
        </section>

        {/* Section 3 — Images */}
        <section className="space-y-4">
          <h2 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">Images</h2>
          <ImageUploader images={images} onChange={setImages} />
          <p className="font-inter-tight text-[11px] text-[#888078]">
            First image is the primary thumbnail. Hover any image to reorder or delete.
          </p>
        </section>

        {/* Section 4 — Categories */}
        <section className="space-y-4">
          <h2 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">Categories</h2>
          <div className="grid grid-cols-3 gap-3">
            {categories.filter(c => c.slug !== "all-pieces").map(c => (
              <label key={c.id} className="flex items-center gap-2.5 cursor-pointer group">
                <span
                  onClick={() => toggleCat(c.slug)}
                  className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    cats.includes(c.slug)
                      ? "bg-[#c9a96e] border-[#c9a96e]"
                      : "border-[rgba(255,255,255,0.2)] hover:border-[#c9a96e]/50"
                  }`}
                >
                  {cats.includes(c.slug) && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#0e0f11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span
                  onClick={() => toggleCat(c.slug)}
                  className="font-inter-tight text-[13px] text-[#e8e4df] select-none"
                >
                  {c.label}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Section 5 — Variants */}
        <section className="space-y-5">
          <h2 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">Available Variants</h2>

          {/* Lengths */}
          <div className="space-y-3">
            <p className="font-inter-tight text-[12px] text-[#888078] uppercase tracking-[1px]">Lengths</p>
            <div className="flex flex-wrap gap-2">
              {/* Show all: defaults first, then any custom values not in defaults */}
              {Array.from(new Set([...DEFAULT_LENGTHS, ...lengths])).map(l => {
                const isSelected = lengths.includes(l);
                const isCustom = !DEFAULT_LENGTHS.includes(l);
                return (
                  <div key={l} className="relative flex items-center">
                    <button
                      type="button"
                      onClick={() => toggleLength(l)}
                      className={`px-3 py-1.5 rounded-full font-inter-tight text-[12px] border transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#c9a96e]/10 border-[#c9a96e]/50 text-[#c9a96e]"
                          : "border-[rgba(255,255,255,0.1)] text-[#888078] hover:border-[rgba(255,255,255,0.2)]"
                      } ${isCustom && isSelected ? "pr-6" : ""}`}
                    >{l}</button>
                    {isCustom && isSelected && (
                      <button
                        type="button"
                        onClick={() => setLengths(prev => prev.filter(x => x !== l))}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#c9a96e]/60 hover:text-[#c9a96e] leading-none cursor-pointer text-[10px]"
                      >✕</button>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Add custom length */}
            <div className="flex items-center gap-2">
              <input
                value={customLengthInput}
                onChange={e => setCustomLengthInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomLength())}
                placeholder='e.g. 30" or 10"'
                className="bg-[#16181d] border border-[rgba(255,255,255,0.07)] focus:border-[#c9a96e]/50 rounded-[8px] px-3 py-1.5 font-inter-tight text-[12px] text-[#e8e4df] placeholder:text-[#888078]/50 outline-none w-32 transition-colors"
              />
              <button
                type="button"
                onClick={addCustomLength}
                disabled={!customLengthInput.trim()}
                className="px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.15)] font-inter-tight text-[12px] text-[#888078] hover:border-[#c9a96e]/50 hover:text-[#c9a96e] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >+ Add</button>
            </div>
          </div>

          {/* Densities */}
          <div className="space-y-3">
            <p className="font-inter-tight text-[12px] text-[#888078] uppercase tracking-[1px]">Densities</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set([...DEFAULT_DENSITIES, ...densities])).map(d => {
                const isSelected = densities.includes(d);
                const isCustom = !DEFAULT_DENSITIES.includes(d);
                return (
                  <div key={d} className="relative flex items-center">
                    <button
                      type="button"
                      onClick={() => toggleDensity(d)}
                      className={`px-3 py-1.5 rounded-full font-inter-tight text-[12px] border transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#c9a96e]/10 border-[#c9a96e]/50 text-[#c9a96e]"
                          : "border-[rgba(255,255,255,0.1)] text-[#888078] hover:border-[rgba(255,255,255,0.2)]"
                      } ${isCustom && isSelected ? "pr-6" : ""}`}
                    >{d}</button>
                    {isCustom && isSelected && (
                      <button
                        type="button"
                        onClick={() => setDensities(prev => prev.filter(x => x !== d))}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#c9a96e]/60 hover:text-[#c9a96e] leading-none cursor-pointer text-[10px]"
                      >✕</button>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Add custom density */}
            <div className="flex items-center gap-2">
              <input
                value={customDensityInput}
                onChange={e => setCustomDensityInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomDensity())}
                placeholder="e.g. 220% or 300%"
                className="bg-[#16181d] border border-[rgba(255,255,255,0.07)] focus:border-[#c9a96e]/50 rounded-[8px] px-3 py-1.5 font-inter-tight text-[12px] text-[#e8e4df] placeholder:text-[#888078]/50 outline-none w-32 transition-colors"
              />
              <button
                type="button"
                onClick={addCustomDensity}
                disabled={!customDensityInput.trim()}
                className="px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.15)] font-inter-tight text-[12px] text-[#888078] hover:border-[#c9a96e]/50 hover:text-[#c9a96e] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >+ Add</button>
            </div>
          </div>
        </section>

        {/* Section 6 — Specifications */}
        <section className="space-y-4">
          <h2 className="font-inter-tight font-medium text-[12px] tracking-[2px] uppercase text-[#888078]">Specifications</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Texture",  value: texture,  set: setTexture,  placeholder: "e.g. Body Wave" },
              { label: "Cap Type", value: capType,  set: setCapType,  placeholder: "HD Transparent Lace" },
              { label: "Origin",   value: origin,   set: setOrigin,   placeholder: "100% Virgin Human Hair" },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label} className="space-y-1.5">
                <label className="font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078]">{label}</label>
                <input
                  value={value}
                  onChange={e => set(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-[#16181d] border border-[rgba(255,255,255,0.07)] focus:border-[#c9a96e]/50 rounded-[8px] px-3 py-2.5 font-inter-tight text-[13px] text-[#e8e4df] placeholder:text-[#888078] outline-none transition-colors"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Save buttons — the toggle above is the publish switch; Save respects it */}
        <section className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.07)]">
          <div className="flex gap-3">
            {/* Secondary: always force-draft (quick unpublish without toggling) */}
            {published && (
              <button
                type="button"
                onClick={() => save(false)}
                disabled={saving || !name || !slug || !price || slugExists}
                className="px-5 py-2.5 rounded-[8px] border border-[rgba(255,255,255,0.15)] font-inter-tight text-[13px] text-[#888078] hover:text-[#e8e4df] hover:bg-[rgba(255,255,255,0.04)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Save as Draft
              </button>
            )}
            {/* Primary: saves using whatever the toggle is set to */}
            <button
              type="button"
              onClick={() => save()}
              disabled={saving || !name || !slug || !price || slugExists}
              className="px-5 py-2.5 rounded-[8px] bg-[#c9a96e] hover:bg-[#d4b87a] font-inter-tight text-[13px] text-[#0e0f11] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {saving ? "Saving…" : published ? "Save & Publish" : "Save as Draft"}
            </button>
          </div>

          {!isNew && (
            <button
              type="button"
              onClick={deleteProduct}
              className="px-4 py-2.5 rounded-[8px] font-inter-tight text-[13px] text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              Delete product
            </button>
          )}
        </section>

      </div>
    </div>
  );
}
