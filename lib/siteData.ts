import { createClient } from '@supabase/supabase-js'

// Anon client — the publishable key + published-only RLS is the entire read
// contract. This app deliberately holds NO privileged credentials: a
// compromised renderer can only ever read what the public sites already show.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
)

// ---------------------------------------------------------------------------
// SiteData — THE THEME CONTRACT. Every theme (stock or Claude-generated
// bespoke) is a component receiving exactly this shape. Generation writes
// content/design INTO this shape (via the CMS); themes only ever read it.
// Keep changes additive — a contract break invalidates every theme at once.
// ---------------------------------------------------------------------------

export interface SiteSettings {
  address?: string
  phone?: string
  email?: string
  announcement?: string
  holiday_hours?: string
  /** JSON string: Record<monday..sunday, {open, close, closed}> */
  hours_struct?: string
  hero_line1?: string
  hero_line2?: string
  hero_description?: string
  hero_image_url?: string
  signature_name?: string
  signature_price?: string
  seo_title?: string
  seo_description?: string
  og_image_url?: string
  google_maps_url?: string
  google_review_url?: string
  instagram?: string
  facebook?: string
  /** Theme key in themes/registry.ts. Default 'aurora'. */
  theme?: string
  // Design tokens (set by hand or by the future Generate step).
  design_primary?: string
  design_accent?: string
  design_bg?: string
  design_ink?: string
  [key: string]: string | undefined
}

export interface SiteService {
  name: string
  priceText: string
  note: string | null
}

export interface SiteTeamMember {
  name: string
  photoUrl: string | null
  bio: string | null
}

export interface SiteGalleryItem {
  imageUrl: string
  alt: string
  caption: string | null
}

export interface SitePromotion {
  title: string
  body: string
}

export interface SiteFaq {
  question: string
  answer: string
}

export interface SiteReview {
  author: string
  quote: string
  rating: number
}

export interface DayHours {
  open: string
  close: string
  closed: boolean
}

export const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
export type DayKey = (typeof DAY_KEYS)[number]

export interface SiteData {
  name: string
  slug: string
  domain: string | null
  bookingUrl: string | null
  settings: SiteSettings
  services: SiteService[]
  team: SiteTeamMember[]
  gallery: SiteGalleryItem[]
  promotions: SitePromotion[]
  faqs: SiteFaq[]
  reviews: SiteReview[]
  hours: Record<DayKey, DayHours> | null
}

// ---------------------------------------------------------------------------

function parseHours(raw: string | undefined): SiteData['hours'] {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Record<string, DayHours>
    const out = {} as Record<DayKey, DayHours>
    for (const day of DAY_KEYS) {
      const d = parsed?.[day]
      if (!d || typeof d.open !== 'string' || typeof d.close !== 'string') return null
      out[day] = { open: d.open, close: d.close, closed: !!d.closed }
    }
    return out
  } catch {
    return null
  }
}

function priceTextFromNumber(price: number | null): string {
  if (price == null) return ''
  return `$${Number(price) % 1 === 0 ? Number(price).toFixed(0) : Number(price).toFixed(2)}`
}

/**
 * Resolve + assemble a site. `tenant` is a slug, or '~hostname' for a
 * custom-domain lookup (see middleware). Returns null when the site doesn't
 * exist or isn't published — RLS already hides unpublished rows from this
 * anon client, so "not found" and "not published" are indistinguishable here
 * by design.
 */
export async function getSiteData(tenant: string): Promise<SiteData | null> {
  const byDomain = tenant.startsWith('~')
  const value = byDomain ? tenant.slice(1) : tenant

  let query = supabase
    .from('websites')
    .select('id, shop_id, slug, name, domain, booking_code, is_published, settings')
  query = byDomain ? query.eq('domain', value) : query.eq('slug', value)
  const { data: site, error } = await query.maybeSingle()
  if (error || !site) return null

  const settings = (site.settings ?? {}) as SiteSettings

  const [galleryRes, promoRes, faqRes, reviewRes, menuRes, svcRes, teamRes] = await Promise.all([
    supabase.from('website_gallery').select('image_url, alt, caption, sort_order').eq('website_id', site.id).order('sort_order'),
    supabase.from('website_promotions').select('title, body, sort_order').eq('website_id', site.id).order('sort_order'),
    supabase.from('website_faqs').select('question, answer, sort_order').eq('website_id', site.id).order('sort_order'),
    supabase.from('website_reviews').select('author, quote, rating, sort_order').eq('website_id', site.id).order('sort_order'),
    supabase.from('website_menu_items').select('name, description, price_text, sort_order').eq('website_id', site.id).order('sort_order'),
    // Linked-shop projections (column-whitelisted public views; empty when unlinked).
    site.shop_id
      ? supabase.from('website_services').select('name, price, website_note, display_order').eq('shop_id', site.shop_id).order('display_order')
      : Promise.resolve({ data: [] as never[] }),
    site.shop_id
      ? supabase.from('website_team').select('name, photo_url, website_bio, display_order').eq('shop_id', site.shop_id).order('display_order')
      : Promise.resolve({ data: [] as never[] }),
  ])

  // Linked shop's REAL menu wins; standalone menu items are the fallback.
  const linkedServices = ((svcRes.data ?? []) as Array<{ name: string; price: number | null; website_note: string | null }>).map((s) => ({
    name: s.name,
    priceText: priceTextFromNumber(s.price),
    note: s.website_note,
  }))
  const menuServices = ((menuRes.data ?? []) as Array<{ name: string; description: string; price_text: string }>).map((m) => ({
    name: m.name,
    priceText: m.price_text || '',
    note: m.description || null,
  }))

  const bookingBase = (process.env.NEXT_PUBLIC_BOOKING_BASE || '').replace(/\/$/, '')

  return {
    name: site.name,
    slug: site.slug,
    domain: site.domain,
    bookingUrl: site.booking_code && bookingBase ? `${bookingBase}/${site.booking_code}` : null,
    settings,
    services: linkedServices.length > 0 ? linkedServices : menuServices,
    team: ((teamRes.data ?? []) as Array<{ name: string; photo_url: string | null; website_bio: string | null }>).map((t) => ({
      name: t.name,
      photoUrl: t.photo_url,
      bio: t.website_bio,
    })),
    gallery: ((galleryRes.data ?? []) as Array<{ image_url: string; alt: string; caption: string | null }>).map((g) => ({
      imageUrl: g.image_url,
      alt: g.alt || '',
      caption: g.caption,
    })),
    promotions: ((promoRes.data ?? []) as Array<{ title: string; body: string }>).map((p) => ({ title: p.title, body: p.body })),
    faqs: ((faqRes.data ?? []) as Array<{ question: string; answer: string }>).map((f) => ({ question: f.question, answer: f.answer })),
    reviews: ((reviewRes.data ?? []) as Array<{ author: string; quote: string; rating: number }>).map((r) => ({
      author: r.author,
      quote: r.quote,
      rating: r.rating,
    })),
    hours: parseHours(settings.hours_struct),
  }
}
