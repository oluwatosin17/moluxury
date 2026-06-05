import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

// POST /api/admin/product — insert new product
export async function POST(req: NextRequest) {
  const supabase = createAdminSupabaseClient();
  const payload = await req.json();
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ product: data });
}

// PUT /api/admin/product — update existing product
export async function PUT(req: NextRequest) {
  const supabase = createAdminSupabaseClient();
  const { id, ...payload } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ product: data });
}

// DELETE /api/admin/product?id=xxx — delete product
export async function DELETE(req: NextRequest) {
  const supabase = createAdminSupabaseClient();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
