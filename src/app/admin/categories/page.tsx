"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminTopbar from "@/components/admin/topbar";
import type { Category } from "@/lib/supabase/types";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminCategories() {
  const [cats, setCats]       = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel]   = useState("");
  const [newSlug, setNewSlug]     = useState("");
  const [newFilter, setNewFilter] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [editId, setEditId]   = useState<string | null>(null);
  const [editLabel, setEditLabel]   = useState("");
  const [editOrder, setEditOrder]   = useState(0);
  const [toast, setToast]     = useState("");

  const supabase = createClient();

  useEffect(() => {
    supabase.from("categories").select("*").order("display_order").then(({ data }) => {
      setCats(data ?? []);
      setLoading(false);
    });
  }, []); // eslint-disable-line

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  async function addCategory() {
    if (!newLabel || !newSlug) return;
    setAdding(true);
    const { data, error } = await supabase.from("categories").insert({
      slug: newSlug,
      label: newLabel,
      is_filter: newFilter,
      display_order: cats.length,
    }).select().single();
    if (!error && data) {
      setCats(prev => [...prev, data]);
      setNewLabel(""); setNewSlug(""); setNewFilter(true);
      showToast("Category added");
    }
    setAdding(false);
  }

  async function saveEdit(id: string) {
    const { error } = await supabase.from("categories")
      .update({ label: editLabel, display_order: editOrder })
      .eq("id", id);
    if (!error) {
      setCats(prev => prev.map(c => c.id === id ? { ...c, label: editLabel, display_order: editOrder } : c));
      setEditId(null);
      showToast("Saved");
      // Revalidate shop page
      await fetch(`/api/revalidate?secret=${process.env.NEXT_PUBLIC_REVALIDATE_SECRET}`, { method: "POST" });
    }
  }

  async function deleteCategory(cat: Category) {
    // Check if any products use this category
    const { count } = await supabase.from("products")
      .select("*", { count: "exact", head: true })
      .contains("category_slugs", [cat.slug]);
    if ((count ?? 0) > 0) {
      alert(`Cannot delete: ${count} product${count === 1 ? "" : "s"} use this category. Reassign them first.`);
      return;
    }
    if (!confirm(`Delete "${cat.label}"?`)) return;
    await supabase.from("categories").delete().eq("id", cat.id);
    setCats(prev => prev.filter(c => c.id !== cat.id));
    showToast("Deleted");
  }

  return (
    <div className="flex flex-col flex-1">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-500/90 text-white font-inter-tight text-[13px] px-5 py-3 rounded-[10px]">
          {toast}
        </div>
      )}
      <AdminTopbar title="Categories" subtitle="Manage shop filter tabs" />
      <div className="flex-1 px-8 py-6 space-y-8 overflow-y-auto">

        {/* Table */}
        <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.07)]">
                {["Label", "Slug", "Filter", "Order", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-inter-tight text-[11px] tracking-[1.5px] uppercase text-[#888078]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center"><div className="w-5 h-5 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : cats.map(c => (
                <tr key={c.id} className="border-b border-[rgba(255,255,255,0.04)] last:border-0">
                  <td className="px-4 py-3">
                    {editId === c.id ? (
                      <input value={editLabel} onChange={e => setEditLabel(e.target.value)}
                        className="bg-[#1e2028] border border-[rgba(255,255,255,0.1)] rounded-[6px] px-2 py-1 font-inter-tight text-[13px] text-[#e8e4df] outline-none w-40"
                      />
                    ) : (
                      <span className="font-inter-tight text-[13px] text-[#e8e4df]">{c.label}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-[#888078]">{c.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`font-inter-tight text-[11px] px-2 py-0.5 rounded-full ${c.is_filter ? "bg-green-500/15 text-green-400" : "bg-[rgba(255,255,255,0.05)] text-[#888078]"}`}>
                      {c.is_filter ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {editId === c.id ? (
                      <input type="number" value={editOrder} onChange={e => setEditOrder(Number(e.target.value))}
                        className="bg-[#1e2028] border border-[rgba(255,255,255,0.1)] rounded-[6px] px-2 py-1 font-inter-tight text-[13px] text-[#e8e4df] outline-none w-16"
                      />
                    ) : (
                      <span className="font-inter-tight text-[13px] text-[#888078]">{c.display_order}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.slug === "all-pieces" ? (
                      <span className="font-inter-tight text-[11px] text-[#888078]">—</span>
                    ) : editId === c.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(c.id)} className="font-inter-tight text-[12px] text-[#c9a96e] hover:underline cursor-pointer">Save</button>
                        <button onClick={() => setEditId(null)} className="font-inter-tight text-[12px] text-[#888078] hover:underline cursor-pointer">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => { setEditId(c.id); setEditLabel(c.label); setEditOrder(c.display_order); }}
                          className="font-inter-tight text-[12px] text-[#888078] hover:text-[#e8e4df] cursor-pointer">Edit</button>
                        <button onClick={() => deleteCategory(c)}
                          className="font-inter-tight text-[12px] text-red-400/70 hover:text-red-400 cursor-pointer">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add new category */}
        <div className="bg-[#16181d] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 space-y-4">
          <h3 className="font-inter-tight font-medium text-[13px] text-[#e8e4df]">Add new category</h3>
          <div className="flex gap-3 items-end">
            <div className="space-y-1.5 flex-1">
              <label className="font-inter-tight text-[11px] uppercase tracking-[1.5px] text-[#888078]">Label</label>
              <input value={newLabel} onChange={e => { setNewLabel(e.target.value); setNewSlug(slugify(e.target.value)); }}
                placeholder="e.g. Lace Front"
                className="w-full bg-[#0e0f11] border border-[rgba(255,255,255,0.07)] rounded-[8px] px-3 py-2.5 font-inter-tight text-[13px] text-[#e8e4df] placeholder:text-[#888078] outline-none focus:border-[#c9a96e]/40"
              />
            </div>
            <div className="space-y-1.5 w-48">
              <label className="font-inter-tight text-[11px] uppercase tracking-[1.5px] text-[#888078]">Slug</label>
              <input value={newSlug} onChange={e => setNewSlug(slugify(e.target.value))}
                className="w-full bg-[#0e0f11] border border-[rgba(255,255,255,0.07)] rounded-[8px] px-3 py-2.5 font-mono text-[12px] text-[#e8e4df] outline-none focus:border-[#c9a96e]/40"
              />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <input type="checkbox" id="filter-chk" checked={newFilter} onChange={e => setNewFilter(e.target.checked)} className="cursor-pointer" />
              <label htmlFor="filter-chk" className="font-inter-tight text-[12px] text-[#888078] cursor-pointer">Show as filter</label>
            </div>
            <button onClick={addCategory} disabled={adding || !newLabel || !newSlug}
              className="bg-[#c9a96e] hover:bg-[#d4b87a] disabled:opacity-40 text-[#0e0f11] font-inter-tight font-medium text-[13px] px-4 py-2.5 rounded-[8px] transition-colors cursor-pointer whitespace-nowrap"
            >
              {adding ? "Adding…" : "Add Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
