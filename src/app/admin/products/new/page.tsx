import { createAdminSupabaseClient } from "@/lib/supabase/server";
import AdminTopbar from "@/components/admin/topbar";
import ProductEditor from "@/components/admin/product-editor";
import Link from "next/link";

export default async function NewProductPage() {
  const supabase = createAdminSupabaseClient();
  const { data: categories } = await supabase.from("categories").select("*").order("display_order");

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar
        title="New Product"
        actions={
          <Link href="/admin/products" className="font-inter-tight text-[13px] text-[#888078] hover:text-[#e8e4df] transition-colors">
            ← Back to products
          </Link>
        }
      />
      <ProductEditor categories={categories ?? []} />
    </div>
  );
}
