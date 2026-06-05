// Pure utility — no server imports, safe in client and server components
export function getImageUrl(storagePath: string): string {
  if (!storagePath) return ''
  if (storagePath.startsWith('http')) return storagePath
  if (storagePath.startsWith('/')) return storagePath
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storagePath}`
}
