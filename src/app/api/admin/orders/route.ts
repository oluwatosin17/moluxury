import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
