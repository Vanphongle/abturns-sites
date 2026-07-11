import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSiteData, getSitePreview, DAY_KEYS } from '@/lib/siteData'
import { resolveSelection } from '@/themes/catalog'
import { getPalette, resolveTokens } from '@/lib/palettes'
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

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { site, isPreview } = await resolve(props)
  if (!site) return { title: 'Not found', robots: { index: false } }
  const s = site.settings
  const title = s.seo_title || site.name
  const description = s.seo_description || s.hero_description || `${site.name} — book your visit today.`
  return {
    title: isPreview ? `[Preview] ${title}` : title,
    description,
    // Draft previews must never be indexed.
    ...(isPreview ? { robots: { index: false, follow: false } } : {}),
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

export default async function SitePage(props: Props) {
  const { site, isPreview, overrides } = await resolve(props)
  if (!site) notFound()

  const selection = resolveSelection(overrides.theme ?? site.themeId, overrides.variation ?? site.variationId)
  const paletteId = overrides.palette ?? site.paletteId ?? selection.theme.defaultPaletteId
  const tokens = resolveTokens(getPalette(paletteId), selection.variation.mode)

  // schema.org LocalBusiness — each salon's OWN search identity (their name,
  // their address, their hours). No ABTurns anywhere.
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'NailSalon',
    name: site.name,
    ...(site.settings.address ? { address: site.settings.address } : {}),
    ...(site.settings.phone ? { telephone: site.settings.phone } : {}),
    ...(site.domain ? { url: `https://${site.domain}` } : {}),
    ...(site.settings.hero_image_url ? { image: site.settings.hero_image_url } : {}),
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <ThemeSite site={site} selection={selection} tokens={tokens} />
    </>
  )
}
