import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

// Returns ALL products including drafts — service role bypasses RLS
export async function GET() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("display_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
