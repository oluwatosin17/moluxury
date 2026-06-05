import { createAdminSupabaseClient } from './admin-client'
import { getImageUrl } from './utils'
import type { DBProduct, Category } from './types'

export { getImageUrl }

export async function getAllProducts(): Promise<DBProduct[]> {
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
  if (error) { console.error('[storefront] getAllProducts error:', error.message); return [] }
  return data ?? []
}

export async function getProductBySlug(slug: string): Promise<DBProduct | null> {
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error) return null
  return data
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_filter', true)
    .order('display_order', { ascending: true })
  if (error) { console.error('[storefront] getCategories error:', error.message); return [] }
  return data ?? []
}
