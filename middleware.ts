import { NextRequest, NextResponse } from 'next/server'

/**
 * Multi-tenant router — the whole trick of this app. One deployment serves
 * every salon site; this middleware turns the incoming HOST into a tenant
 * path that app/sites/[slug] renders:
 *
 *   {slug}.<PREVIEW_BASE>          → /sites/{slug}           (preview subdomain)
 *   {slug}.localhost               → /sites/{slug}           (local dev)
 *   any other host (custom domain) → /sites/~{hostname}      ('~' = lookup by domain)
 *   /sites/... direct              → untouched               (dev convenience)
 *
 * The '~' prefix keeps ONE dynamic route: the page resolves plain values as
 * websites.slug and '~'-values as websites.domain.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const { pathname } = url

  // Skip Next internals/static + direct tenant paths.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/sites') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const hostname = (req.headers.get('host') || '').split(':')[0].toLowerCase()
  const base = (process.env.NEXT_PUBLIC_PREVIEW_BASE_DOMAIN || '').toLowerCase()

  let tenant: string | null = null
  if (base && hostname.endsWith(`.${base}`)) {
    tenant = hostname.slice(0, -(base.length + 1))
  } else if (hostname.endsWith('.localhost')) {
    tenant = hostname.slice(0, -'.localhost'.length)
  } else if (hostname === 'localhost' || (base && hostname === base)) {
    // The bare app/base domain — the root landing page, not a tenant.
    return NextResponse.next()
  } else if (hostname) {
    // A customer's own domain pointed at this deployment.
    tenant = `~${hostname}`
  }

  if (!tenant) return NextResponse.next()

  const rewrite = url.clone()
  rewrite.pathname = `/sites/${tenant}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(rewrite)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
