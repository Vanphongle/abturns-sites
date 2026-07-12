import { createClient } from '@supabase/supabase-js'

// Host-level sitemap INDEX for the BASE domain: one entry per published
// slug-based site's own sitemap. Sites with a custom domain are excluded —
// their canonical home (and sitemap) lives on their domain, not here.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
)

export async function GET(req: Request) {
  const host = req.headers.get('host') || ''
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const origin = (process.env.NEXT_PUBLIC_SITES_PUBLIC_ORIGIN || `${proto}://${host}`).replace(/\/$/, '')

  const { data } = await supabase
    .from('websites')
    .select('slug, domain, is_published, updated_at')
    .eq('is_published', true)
  const sites = ((data ?? []) as Array<{ slug: string; domain: string | null; updated_at: string | null }>)
    .filter((s) => !s.domain)

  const entries = sites
    .map((s) => `  <sitemap>
    <loc>${origin}/sites/${s.slug}/sitemap.xml</loc>${s.updated_at ? `
    <lastmod>${new Date(s.updated_at).toISOString()}</lastmod>` : ''}
  </sitemap>`)
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>
`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
  })
}
