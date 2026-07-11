import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSiteData, getSitePreview, DAY_KEYS } from '@/lib/siteData'
import { resolveSelection } from '@/themes/catalog'
import { getPalette, resolveTokens } from '@/lib/palettes'
import { parseLocality } from '@/lib/locality'
import ThemeSite from '@/themes/ThemeSite'

// ISR — content edits in the ABTurns Website app show within a minute,
// matching the promise the admin UI makes. Preview requests (?preview=token)
// read searchParams and therefore render dynamically, uncached.
export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string; theme?: string; variation?: string; palette?: string }>
}

async function resolve(props: Props) {
  const { slug } = await props.params
  const { preview, theme, variation, palette } = await props.searchParams
  const tenant = decodeURIComponent(slug)
  if (preview) {
    // Drafts render ONLY via the token capability (slug + secret must match).
    // Theme/variation/palette overrides are PREVIEW-ONLY (the builder's live
    // previews of unsaved selections) — public URLs stay ISR-cacheable.
    return {
      site: await getSitePreview(tenant.replace(/^~/, ''), preview),
      isPreview: true,
      overrides: { theme, variation, palette },
    }
  }
  return { site: await getSiteData(tenant), isPreview: false, overrides: {} as { theme?: string; variation?: string; palette?: string } }
}

/** The site's canonical public URL: custom domain first, else the shared
 *  sites host (env; no request headers so ISR stays intact). */
function canonicalUrl(site: { domain: string | null; slug: string }): string | null {
  if (site.domain) return `https://${site.domain}/`
  const base = (process.env.NEXT_PUBLIC_SITES_PUBLIC_ORIGIN || '').replace(/\/$/, '')
  return base ? `${base}/sites/${site.slug}` : null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { site, isPreview } = await resolve(props)
  if (!site) return { title: 'Not found', robots: { index: false } }
  const s = site.settings
  const loc = parseLocality(s.address)
  // Locality-aware defaults — "nail salon in {city}" is the query that matters.
  const cityTail = loc.city ? ` — Nail Salon in ${loc.city}${loc.state ? `, ${loc.state}` : ''}` : ''
  const title = s.seo_title || `${site.name}${cityTail}`
  const description =
    s.seo_description ||
    s.hero_description ||
    (loc.city
      ? `${site.name} is a nail salon in ${loc.city}${loc.state ? `, ${loc.state}` : ''}. Book manicures, pedicures, gel and nail art.`
      : `${site.name} — book your visit today.`)
  const canonical = canonicalUrl(site)
  return {
    title: isPreview ? `[Preview] ${title}` : title,
    description,
    // Draft previews must never be indexed.
    ...(isPreview ? { robots: { index: false, follow: false } } : {}),
    ...(!isPreview && canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title,
      description,
      ...(s.og_image_url || s.hero_image_url
        ? { images: [{ url: (s.og_image_url || s.hero_image_url)! }] }
        : {}),
      type: 'website',
    },
  }
}

/** "$" / "$$" / "$$$" from the average listed service price. */
function priceRange(services: Array<{ priceText: string }>): string | null {
  const nums = services
    .map((s) => parseFloat((s.priceText || '').replace(/[^0-9.]/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0)
  if (nums.length === 0) return null
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length
  return avg < 40 ? '$' : avg <= 80 ? '$$' : '$$$'
}

export default async function SitePage(props: Props) {
  const { site, isPreview, overrides } = await resolve(props)
  if (!site) notFound()

  const selection = resolveSelection(overrides.theme ?? site.themeId, overrides.variation ?? site.variationId)
  const paletteId = overrides.palette ?? site.paletteId ?? selection.theme.defaultPaletteId
  const tokens = resolveTokens(getPalette(paletteId), selection.variation.mode)

  const st = site.settings
  const loc = parseLocality(st.address)
  const canonical = canonicalUrl(site)
  const range = priceRange(site.services)
  const sameAs = [st.instagram, st.facebook, st.yelp].filter(Boolean) as string[]

  // schema.org LocalBusiness — each salon's OWN search identity (their name,
  // their address, their hours). No ABTurns anywhere.
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'NailSalon',
    name: site.name,
    ...(st.address
      ? {
          address: loc.city
            ? {
                '@type': 'PostalAddress',
                ...(loc.street ? { streetAddress: loc.street } : {}),
                addressLocality: loc.city,
                ...(loc.state ? { addressRegion: loc.state } : {}),
                ...(loc.zip ? { postalCode: loc.zip } : {}),
              }
            : st.address,
        }
      : {}),
    ...(st.phone ? { telephone: st.phone } : {}),
    ...(st.email ? { email: st.email } : {}),
    ...(canonical ? { url: canonical } : site.domain ? { url: `https://${site.domain}` } : {}),
    ...(st.hero_image_url ? { image: st.hero_image_url } : {}),
    ...(range ? { priceRange: range } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(site.hours
      ? {
          openingHoursSpecification: DAY_KEYS.filter((d) => !site.hours![d].closed).map((d) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: d.charAt(0).toUpperCase() + d.slice(1),
            opens: site.hours![d].open,
            closes: site.hours![d].close,
          })),
        }
      : {}),
  }

  // FAQPage schema — ONLY from the site's real, owner-editable FAQ content.
  const faqLd: Record<string, unknown> | null =
    site.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: site.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }
      : null

  return (
    <>
      {isPreview ? (
        <div
          style={{
            position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            zIndex: 1000, background: '#221c17', color: '#faf7f3',
            padding: '10px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            boxShadow: '0 6px 24px rgba(0,0,0,0.3)', fontFamily: 'var(--font-body)',
          }}
        >
          Draft preview — this page is not public yet
        </div>
      ) : (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          {faqLd && (
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
          )}
        </>
      )}
      <ThemeSite site={site} selection={selection} tokens={tokens} />
    </>
  )
}
