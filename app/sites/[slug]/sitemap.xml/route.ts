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

  let query = supabase.from('websites').select('id, slug, domain, is_published, updated_at')
  query = byDomain ? query.eq('domain', value) : query.eq('slug', value)
  const { data: site } = await query.maybeSingle()
  if (!site || !site.is_published) return new Response('Not found', { status: 404 })

  const { data: posts } = await supabase
    .from('website_posts')
    .select('slug, published_at')
    .eq('website_id', (site as { id: string }).id)
    .eq('is_published', true)

  const host = req.headers.get('host') || ''
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  // On a custom domain the canonical URL is the root; on the shared sites
  // host it's the /sites/{slug} path.
  const loc = site.domain
    ? `https://${site.domain}/`
    : byDomain
      ? `${proto}://${host}/`
      : `${proto}://${host}/sites/${site.slug}`
  const lastmod = site.updated_at ? new Date(site.updated_at as string).toISOString() : new Date().toISOString()

  const base = loc.replace(/\/$/, '')
  const postUrls = ((posts ?? []) as Array<{ slug: string; published_at: string | null }>)
    .map((p) => `  <url>
    <loc>${base}/blog/${p.slug}</loc>${p.published_at ? `
    <lastmod>${new Date(p.published_at).toISOString()}</lastmod>` : ''}
  </url>`)
    .join('\n')
  const blogIndex = postUrls
    ? `  <url>
    <loc>${base}/blog</loc>
    <changefreq>weekly</changefreq>
  </url>\n`
    : ''
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
  </url>
${blogIndex}${postUrls}
</urlset>
`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
  })
}
