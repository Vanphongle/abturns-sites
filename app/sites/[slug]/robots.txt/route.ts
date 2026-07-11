import { createClient } from '@supabase/supabase-js'

// Per-tenant robots.txt, served at the DOMAIN ROOT via the middleware
// rewrite (customdomain.com/robots.txt → /sites/~host/robots.txt).
// Published sites: allow everything + point at the sitemap. Unpublished or
// unknown tenants: disallow all (drafts must never be crawled).

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
)

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const tenant = decodeURIComponent(slug)
  const byDomain = tenant.startsWith('~')
  const value = byDomain ? tenant.slice(1) : tenant

  let query = supabase.from('websites').select('slug, domain, is_published')
  query = byDomain ? query.eq('domain', value) : query.eq('slug', value)
  const { data: site } = await query.maybeSingle()

  // RLS hides unpublished rows from anon → null covers unknown AND drafts.
  if (!site || !site.is_published) {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  const host = req.headers.get('host') || ''
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const base = site.domain ? `https://${site.domain}` : `${proto}://${host}`
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600' },
  })
}
