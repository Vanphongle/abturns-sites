import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSiteData, DAY_KEYS } from '@/lib/siteData'
import { resolveTheme } from '@/themes/registry'

// ISR — content edits in the ABTurns Website app show within a minute,
// matching the promise the admin UI makes.
export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const site = await getSiteData(decodeURIComponent(slug))
  if (!site) return { title: 'Not found', robots: { index: false } }
  const s = site.settings
  const title = s.seo_title || site.name
  const description = s.seo_description || s.hero_description || `${site.name} — book your visit today.`
  return {
    title,
    description,
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

export default async function SitePage({ params }: Props) {
  const { slug } = await params
  const site = await getSiteData(decodeURIComponent(slug))
  if (!site) notFound()

  const Theme = resolveTheme(site.settings.theme)

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Theme site={site} />
    </>
  )
}
