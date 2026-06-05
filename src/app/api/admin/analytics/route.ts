import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // Date range — defaults to last 30 days if not supplied
  const to   = searchParams.get("to")   ?? new Date().toISOString().slice(0, 10);
  const from = searchParams.get("from") ?? (() => {
    const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().slice(0, 10);
  })();

  // Convert to full ISO strings for Supabase range queries
  const fromISO = `${from}T00:00:00.000Z`;
  const toISO   = `${to}T23:59:59.999Z`;

  const supabase = createAdminSupabaseClient();

  // Fetch all-time products (published/draft counts don't change with date filter)
  // Fetch orders and bookings in range only
  const [productsRes, ordersInRangeRes, allOrdersRes, bookingsInRangeRes, allBookingsRes] = await Promise.all([
    supabase.from("products").select("id, name, slug, price_naira, is_published, category_slugs, images, display_order").order("display_order"),
    supabase.from("orders").select("id, subtotal, status, items, created_at").gte("created_at", fromISO).lte("created_at", toISO),
    supabase.from("orders").select("id, subtotal, status, items, created_at"),
    supabase.from("bookings").select("id, status, created_at, service_name").gte("created_at", fromISO).lte("created_at", toISO),
    supabase.from("bookings").select("id, status, created_at, service_name"),
  ]);

  const products      = productsRes.data      ?? [];
  const orders        = ordersInRangeRes.data ?? [];
  const allOrders     = allOrdersRes.data     ?? [];
  const bookings      = bookingsInRangeRes.data ?? [];
  const allBookings   = allBookingsRes.data     ?? [];

  // ── Product stats (all-time) ───────────────────────────────────────────────
  const totalProducts  = products.length;
  const publishedCount = products.filter(p => p.is_published).length;
  const draftCount     = totalProducts - publishedCount;

  // ── Revenue stats (in range) ───────────────────────────────────────────────
  const totalRevenue  = orders.reduce((s, o) => s + (o.subtotal ?? 0), 0);
  const paidRevenue   = orders
    .filter(o => !["pending", "cancelled", "refunded"].includes(o.status))
    .reduce((s, o) => s + (o.subtotal ?? 0), 0);
  const avgOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;

  // ── Order/booking status breakdown (in range) ──────────────────────────────
  const ordersByStatus: Record<string, number> = {};
  for (const o of orders) ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;

  const bookingsByStatus: Record<string, number> = {};
  for (const b of bookings) bookingsByStatus[b.status] = (bookingsByStatus[b.status] ?? 0) + 1;

  // ── Top products by revenue (in range) ────────────────────────────────────
  const productRevenue: Record<string, { name: string; slug: string; revenue: number; units: number; image: string }> = {};
  for (const order of orders) {
    const items: { slug?: string; name?: string; priceNum?: number; quantity?: number }[] =
      Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const key   = item.slug ?? item.name ?? "unknown";
      const rev   = (item.priceNum ?? 0) * (item.quantity ?? 1);
      const units = item.quantity ?? 1;
      if (!productRevenue[key]) {
        const prod = products.find(p => p.slug === item.slug || p.name === item.name);
        productRevenue[key] = {
          name:  item.name ?? key,
          slug:  item.slug ?? key,
          revenue: 0, units: 0,
          image: prod?.images?.[0] ?? `/products/${item.slug ?? "default"}-1.jpg`,
        };
      }
      productRevenue[key].revenue += rev;
      productRevenue[key].units   += units;
    }
  }
  const topProducts = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  // ── Time series: one entry per day in the selected range ──────────────────
  const fromDate = new Date(from);
  const toDate   = new Date(to);
  const days: { date: string; revenue: number; orders: number; bookings: number }[] = [];

  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    const dateStr   = d.toISOString().slice(0, 10);
    const dayOrders   = orders.filter(o => o.created_at.slice(0, 10) === dateStr);
    const dayBookings = bookings.filter(b => b.created_at.slice(0, 10) === dateStr);
    days.push({
      date:     dateStr,
      revenue:  dayOrders.reduce((s, o) => s + (o.subtotal ?? 0), 0),
      orders:   dayOrders.length,
      bookings: dayBookings.length,
    });
  }

  // ── Recent activity (in range, latest first) ───────────────────────────────
  const recentActivity = [
    ...orders.map(o => ({ type: "order"   as const, id: o.id, date: o.created_at, status: o.status, amount: o.subtotal })),
    ...bookings.map(b => ({ type: "booking" as const, id: b.id, date: b.created_at, status: b.status, service: b.service_name })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  // ── All-time totals for summary cards ─────────────────────────────────────
  const allTimeRevenue  = allOrders.reduce((s, o) => s + (o.subtotal ?? 0), 0);
  const allTimeBookings = allBookings.length;

  return NextResponse.json({
    range: { from, to },
    products:  { total: totalProducts, published: publishedCount, draft: draftCount },
    orders: { total: orders.length, totalRevenue, paidRevenue, avgOrderValue, byStatus: ordersByStatus },
    bookings:  { total: bookings.length, byStatus: bookingsByStatus },
    allTime:   { revenue: allTimeRevenue, orders: allOrders.length, bookings: allTimeBookings },
    topProducts,
    timeSeries: days,
    recentActivity,
  });
}
