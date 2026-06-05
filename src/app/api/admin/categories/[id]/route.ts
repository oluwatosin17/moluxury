import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminSupabaseClient();
  const body = await req.json();
  const { data, error } = await supabase
    .from("categories")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createAdminSupabaseClient();
  // Check no products use this category
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact" })
    .contains("category_slugs", [params.id]);
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: `${count} product(s) use this category. Reassign first.` }, { status: 409 });
  }
  const { error } = await supabase.from("categories").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
