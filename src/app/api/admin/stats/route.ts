import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminSupabaseClient();

  // Run sequentially to avoid any potential parallel execution issues
  const ordersData = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5);
  const bookingsData = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(5);
  const productCount = await supabase.from("products").select("id", { count: "exact" }).eq("is_published", true);
  const orderCount = await supabase.from("orders").select("id", { count: "exact" });
  const bookingCount = await supabase.from("bookings").select("id", { count: "exact" });
  const pendingCount = await supabase.from("orders").select("id", { count: "exact" }).eq("status", "pending");

  return NextResponse.json({
    stats: {
      products: productCount.count ?? 0,
      orders:   orderCount.count   ?? 0,
      bookings: bookingCount.count ?? 0,
      pending:  pendingCount.count ?? 0,
    },
    recentOrders:   ordersData.data   ?? [],
    recentBookings: bookingsData.data ?? [],
  });
}
