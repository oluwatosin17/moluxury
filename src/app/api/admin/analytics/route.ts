import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminSupabaseClient();

  const [productsRes, ordersRes, bookingsRes] = await Promise.all([
    supabase.from("products").select("id, name, slug, price_naira, is_published, category_slugs, images, display_order").order("display_order"),
    supabase.from("orders").select("id, subtotal, status, items, created_at"),
    supabase.from("bookings").select("id, status, created_at, service_name"),
  ]);

  const products  = productsRes.data  ?? [];
  const orders    = ordersRes.data    ?? [];
  const bookings  = bookingsRes.data  ?? [];

  // ── Product stats ──────────────────────────────────────────────────────────
  const totalProducts   = products.length;
  const publishedCount  = products.filter(p => p.is_published).length;
  const draftCount      = totalProducts - publishedCount;

  // ── Revenue stats ──────────────────────────────────────────────────────────
  const totalRevenue    = orders.reduce((s, o) => s + (o.subtotal ?? 0), 0);
  const paidRevenue     = orders
    .filter(o => !["pending", "cancelled", "refunded"].includes(o.status))
    .reduce((s, o) => s + (o.subtotal ?? 0), 0);
  const avgOrderValue   = orders.length ? Math.round(totalRevenue / orders.length) : 0;

  // ── Order status breakdown ─────────────────────────────────────────────────
  const ordersByStatus: Record<string, number> = {};
  for (const o of orders) {
    ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
  }

  // ── Top products by revenue (parse items array in each order) ─────────────
  const productRevenue: Record<string, { name: string; slug: string; revenue: number; units: number; image: string }> = {};
  for (const order of orders) {
    const items: { slug?: string; name?: string; priceNum?: number; quantity?: number }[] =
      Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const key   = item.slug ?? item.name ?? "unknown";
      const rev   = (item.priceNum ?? 0) * (item.quantity ?? 1);
      const units = item.quantity ?? 1;
      if (!productRevenue[key]) {
        const prod  = products.find(p => p.slug === item.slug || p.name === item.name);
        productRevenue[key] = {
          name: item.name ?? key,
          slug: item.slug ?? key,
          revenue: 0,
          units: 0,
          image: prod?.images?.[0] ?? `/products/${item.slug ?? "default"}-1.jpg`,
        };
      }
      productRevenue[key].revenue += rev;
      productRevenue[key].units   += units;
    }
  }
  const topProducts = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ── Revenue by day (last 30 days) ─────────────────────────────────────────
  const now   = new Date();
  const days: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter(o => o.created_at.slice(0, 10) === dateStr);
    days.push({
      date:    dateStr,
      revenue: dayOrders.reduce((s, o) => s + (o.subtotal ?? 0), 0),
      orders:  dayOrders.length,
    });
  }

  // ── Recent activity (orders + bookings merged, sorted by created_at) ───────
  const recentActivity = [
    ...orders.slice(0, 10).map(o => ({ type: "order" as const, id: o.id, date: o.created_at, status: o.status, amount: o.subtotal })),
    ...bookings.slice(0, 10).map(b => ({ type: "booking" as const, id: b.id, date: b.created_at, status: b.status, service: b.service_name })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 15);

  // ── Booking status breakdown ───────────────────────────────────────────────
  const bookingsByStatus: Record<string, number> = {};
  for (const b of bookings) {
    bookingsByStatus[b.status] = (bookingsByStatus[b.status] ?? 0) + 1;
  }

  return NextResponse.json({
    products: { total: totalProducts, published: publishedCount, draft: draftCount },
    orders: {
      total:        orders.length,
      totalRevenue,
      paidRevenue,
      avgOrderValue,
      byStatus:     ordersByStatus,
    },
    bookings: { total: bookings.length, byStatus: bookingsByStatus },
    topProducts,
    revenueByDay: days,
    recentActivity,
  });
}
