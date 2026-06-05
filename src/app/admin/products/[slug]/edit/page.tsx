import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AdminTopbar from "@/components/admin/topbar";
import ProductEditor from "@/components/admin/product-editor";
import Link from "next/link";

export default async function EditProductPage({ params }: { params: { slug: string } }) {
  const supabase = createAdminSupabaseClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("slug", params.slug).single(),
    supabase.from("categories").select("*").order("display_order"),
  ]);
  if (!product) notFound();

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar
        title={product.name}
        subtitle={`/shop/${product.slug}`}
        actions={
          <div className="flex items-center gap-3">
            <a href={`/shop/${product.slug}`} target="_blank" rel="noopener noreferrer"
              className="font-inter-tight text-[13px] text-[#888078] hover:text-[#e8e4df] transition-colors"
            >View on site ↗</a>
            <Link href="/admin/products" className="font-inter-tight text-[13px] text-[#888078] hover:text-[#e8e4df] transition-colors">
              ← Back
            </Link>
          </div>
        }
      />
      <ProductEditor product={product} categories={categories ?? []} />
    </div>
  );
}
