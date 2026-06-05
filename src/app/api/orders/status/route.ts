import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ref = searchParams.get('ref')?.toUpperCase()
  if (!ref) return NextResponse.json({ error: 'Missing ref' }, { status: 400 })

  try {
    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from('orders')
      .select('order_ref, created_at, status, items, subtotal, tracking_number, customer_name')
      .eq('order_ref', ref)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
