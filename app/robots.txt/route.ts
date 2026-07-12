// Root robots for the BASE host (custom-domain hosts never reach this —
// middleware rewrites their /robots.txt to the per-site route). Allow all
// and point at the host sitemap index so crawlers can discover every
// published slug-based site.
export async function GET(req: Request) {
  const host = req.headers.get('host') || ''
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const origin = (process.env.NEXT_PUBLIC_SITES_PUBLIC_ORIGIN || `${proto}://${host}`).replace(/\/$/, '')
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600' },
  })
}
