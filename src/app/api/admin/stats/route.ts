import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

export async function GET() {
  const supabase = createAdminSupabaseClient();

  const [products, orders, bookings, pending, recentOrders, recentBookings] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  return NextResponse.json({
    stats: {
      products: products.count ?? 0,
      orders: orders.count ?? 0,
      bookings: bookings.count ?? 0,
      pending: pending.count ?? 0,
    },
    recentOrders: recentOrders.data ?? [],
    recentBookings: recentBookings.data ?? [],
  });
}
