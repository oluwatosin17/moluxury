import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }
  const slug = searchParams.get('slug')
  if (slug) revalidatePath(`/shop/${slug}`)
  revalidatePath('/shop')
  revalidatePath('/')
  revalidatePath('/sitemap.xml')
  return NextResponse.json({ revalidated: true, slug: slug ?? 'all' })
}
