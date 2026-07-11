import { createClient } from '@supabase/supabase-js'

// Per-tenant sitemap.xml (single-page site → one canonical URL), served at
// the domain root via the middleware rewrite. Unpublished/unknown → 404.

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
)

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const tenant = decodeURIComponent(slug)
  const byDomain = tenant.startsWith('~')
  const value = byDomain ? tenant.slice(1) : tenant

  let query = supabase.from('websites').select('slug, domain, is_published, updated_at')
  query = byDomain ? query.eq('domain', value) : query.eq('slug', value)
  const { data: site } = await query.maybeSingle()
  if (!site || !site.is_published) return new Response('Not found', { status: 404 })

  const host = (req.headers.get('host') || '').split(':')[0]
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  // On a custom domain the canonical URL is the root; on the shared sites
  // host it's the /sites/{slug} path.
  const loc = site.domain
    ? `https://${site.domain}/`
    : byDomain
      ? `${proto}://${host}/`
      : `${proto}://${host}/sites/${site.slug}`
  const lastmod = site.updated_at ? new Date(site.updated_at as string).toISOString() : new Date().toISOString()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
  </url>
</urlset>
`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
  })
}
