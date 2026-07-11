import type { CSSProperties } from 'react'
import type { SiteData, DayKey, DayHours } from '@/lib/siteData'
import { DAY_KEYS } from '@/lib/siteData'
import type { ThemeSelection, SectionId } from './catalog'
import type { PaletteTokens } from '@/lib/palettes'
import { getStockSet } from '@/lib/stockPhotos'
import Reveal from './Reveal'
import s from './theme.module.css'

const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

/** '14:30' → '2:30 PM'. */
function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  if (!Number.isFinite(h)) return hhmm
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return m ? `${hour12}:${String(m).padStart(2, '0')} ${suffix}` : `${hour12} ${suffix}`
}

/** Safe JSON-array parse for settings fields that ride as JSON strings. */
function parseJsonArray<T>(raw: string | undefined): T[] {
  if (!raw) return []
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? (v as T[]) : []
  } catch {
    return []
  }
}

interface HourRow { label: string; value: string; closed: boolean; isToday: boolean }

/** Collapse consecutive days with identical hours ("Monday — Friday"). */
function groupHours(hours: Record<DayKey, DayHours>): HourRow[] {
  const todayKey = DAY_KEYS[(new Date().getDay() + 6) % 7]
  const sig = (d: DayHours) => (d.closed ? 'closed' : `${d.open}|${d.close}`)
  const rows: HourRow[] = []
  let start = 0
  for (let i = 1; i <= DAY_KEYS.length; i++) {
    if (i === DAY_KEYS.length || sig(hours[DAY_KEYS[i]]) !== sig(hours[DAY_KEYS[start]])) {
      const a = DAY_KEYS[start]
      const b = DAY_KEYS[i - 1]
      const d = hours[a]
      rows.push({
        label: a === b ? DAY_LABELS[a] : `${DAY_LABELS[a]} — ${DAY_LABELS[b]}`,
        value: d.closed ? 'Closed' : `${fmtTime(d.open)} – ${fmtTime(d.close)}`,
        closed: d.closed,
        isToday: (DAY_KEYS.slice(start, i) as DayKey[]).includes(todayKey),
      })
      start = i
    }
  }
  return rows
}

interface GalleryImage {
  imageUrl: string
  alt: string
  caption: string | null
  w?: number
  h?: number
}

interface ThemeSiteProps {
  site: SiteData
  selection: ThemeSelection
  tokens: PaletteTokens
}

/**
 * The shared section engine (Website Builder v1, luxury lineup). Every theme
 * × variation × palette renders through THIS component: the variation config
 * picks section order + style axes (data-attributes → theme.module.css
 * variants) and the palette provides the --c-* tokens. Sections are pure
 * functions of SiteData slices.
 *
 * Imagery falls back to the curated sample set (lib/stockPhotos.ts) so a
 * brand-new site is photo-rich from the first render; shops replace the
 * samples by uploading their own. CLAIM sections (reviews, promotions,
 * FAQs, team) are NEVER faked — they stay hidden until real content exists,
 * and a stock gallery is headed "The experience", never "Our work".
 * No platform branding or backlinks — the site is entirely the salon's own.
 */
export default function ThemeSite({ site, selection, tokens }: ThemeSiteProps) {
  const st = site.settings
  const v = selection.variation
  const vars = {
    '--c-primary': tokens.primary,
    '--c-accent': tokens.accent,
    '--c-bg': tokens.bg,
    '--c-ink': tokens.ink,
  } as CSSProperties

  const stock = getStockSet(v.stockMood)
  const heroImage: GalleryImage = st.hero_image_url
    ? { imageUrl: st.hero_image_url, alt: site.name, caption: null }
    : { imageUrl: stock.hero.src, alt: stock.hero.alt, caption: null, w: stock.hero.w, h: stock.hero.h }
  const heroSides: [GalleryImage, GalleryImage] =
    site.gallery.length >= 2
      ? [site.gallery[0], site.gallery[1]]
      : stock.sides.map((p) => ({ imageUrl: p.src, alt: p.alt, caption: null, w: p.w, h: p.h })) as [GalleryImage, GalleryImage]
  const isStockGallery = site.gallery.length === 0
  const galleryItems: GalleryImage[] = isStockGallery
    ? stock.gallery.map((p) => ({ imageUrl: p.src, alt: p.alt, caption: p.label ?? null, w: p.w, h: p.h }))
    : site.gallery

  // AI-written content layer (arrays ride as JSON strings in settings).
  const ticker = parseJsonArray<string>(st.ticker_json).filter((t) => typeof t === 'string' && t.trim())
  const pillars = parseJsonArray<{ title?: string; body?: string }>(st.philosophy_pillars_json)
    .filter((p) => p && typeof p.title === 'string')
  const hourRows = site.hours ? groupHours(site.hours) : []

  const bookHref = site.bookingUrl || (st.phone ? `tel:${st.phone.replace(/[^+\d]/g, '')}` : null)
  const bookLabel = site.bookingUrl ? 'Book now' : st.phone ? 'Call to book' : null

  const nav: Array<{ id: string; label: string; show: boolean }> = [
    { id: 'services', label: 'Services', show: site.services.length > 0 },
    { id: 'gallery', label: 'Gallery', show: true },
    { id: 'team', label: 'Team', show: site.team.length > 0 },
    { id: 'reviews', label: 'Reviews', show: site.reviews.length > 0 },
    { id: 'visit', label: 'Visit', show: true },
  ]

  const sections: Record<SectionId, React.ReactNode> = {
    announcement: st.announcement ? (
      <div key="announcement" className={s.announce}>{st.announcement}</div>
    ) : null,

    hero: (
      <div key="hero">
        <Hero
          site={site}
          heroImage={heroImage}
          heroSides={heroSides}
          bookHref={bookHref}
          bookLabel={bookLabel}
          heroStyle={v.hero}
        />
        {ticker.length > 0 && (
          <div className={s.ticker} aria-label="Specialties">
            {ticker.slice(0, 6).map((t, i) => (
              <span key={i} className={s.tickerItem}>{t}</span>
            ))}
          </div>
        )}
      </div>
    ),

    philosophy: st.philosophy_statement ? (
      <section key="philosophy" className={s.philoBand}>
        <div className={`${s.container} ${s.section}`}>
          <Reveal>
            <div className={s.philoKicker}>{st.philosophy_kicker || 'Our philosophy'}</div>
            <h2 className={s.philoStatement}>
              {st.philosophy_statement} {st.philosophy_em && <em>{st.philosophy_em}</em>}
            </h2>
            {pillars.length > 0 && (
              <div className={s.pillars}>
                {pillars.slice(0, 3).map((p, i) => (
                  <div key={i} className={s.pillar}>
                    <div className={s.pillarTitle}>{p.title}</div>
                    {p.body && <p className={s.pillarBody}>{p.body}</p>}
                  </div>
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </section>
    ) : null,

    promotions: site.promotions.length > 0 ? (
      <section key="promotions" className={s.sectionAlt}>
        <div className={`${s.container} ${s.section}`}>
          <Reveal>
            <SectionHead kicker="Right now" title="Current offers" />
            <div className={s.promoGrid}>
              {site.promotions.map((p, i) => (
                <div key={i} className={s.promoCard}>
                  <div className={s.promoKicker}>Offer</div>
                  <div className={s.promoTitle}>{p.title}</div>
                  {p.body && <p className={s.promoBody}>{p.body}</p>}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    ) : null,

    services: site.services.length > 0 ? (
      <section key="services" id="services" className={s.section}>
        <div className={s.container}>
          <Reveal>
            <SectionHead kicker="The menu" title="Services" />
            <Services services={site.services} styleAxis={v.services} />
          </Reveal>
        </div>
      </section>
    ) : null,

    gallery: (
      <section key="gallery" id="gallery" className={s.sectionAlt}>
        <div className={`${s.container} ${s.section}`}>
          <Reveal>
            {/* Honest heading: stock imagery is "the experience", never "our work". */}
            <SectionHead
              kicker={isStockGallery ? 'Step inside' : 'Our work'}
              title={isStockGallery ? 'The experience' : 'Gallery'}
            />
            <Gallery items={galleryItems} styleAxis={v.gallery} siteName={site.name} />
          </Reveal>
        </div>
      </section>
    ),

    team: site.team.length > 0 ? (
      <section key="team" id="team" className={s.section}>
        <div className={s.container}>
          <Reveal>
            <SectionHead kicker="The people" title="Meet the team" />
            <div className={s.teamGrid}>
              {site.team.map((m, i) => (
                <div key={i} className={s.teamCard}>
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photoUrl} alt={m.name} className={s.teamPhoto} loading="lazy" />
                  ) : (
                    <div className={s.teamInitial} aria-hidden>{m.name.charAt(0).toUpperCase()}</div>
                  )}
                  <div className={s.teamName}>{m.name}</div>
                  {m.bio && <p className={s.teamBio}>{m.bio}</p>}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    ) : null,

    reviews: site.reviews.length > 0 ? (
      <section key="reviews" id="reviews" className={s.sectionAlt}>
        <div className={`${s.container} ${s.section}`}>
          <Reveal>
            <SectionHead kicker="Kind words" title="What clients say" />
            <div className={s.reviewGrid}>
              {site.reviews.map((r, i) => (
                <blockquote key={i} className={s.reviewCard}>
                  <div className={s.stars} aria-label={`${r.rating} out of 5 stars`}>
                    {'★'.repeat(Math.max(1, Math.min(5, r.rating)))}
                  </div>
                  <p className={s.reviewQuote}>{r.quote}</p>
                  <footer className={s.reviewAuthor}>{r.author}</footer>
                </blockquote>
              ))}
            </div>
            {st.google_review_url && (
              <p className={s.reviewMore}>
                <a href={st.google_review_url} target="_blank" rel="noopener noreferrer" className={s.textLink}>
                  Read more reviews on Google
                </a>
              </p>
            )}
          </Reveal>
        </div>
      </section>
    ) : null,

    faqs: site.faqs.length > 0 ? (
      <section key="faqs" className={s.section}>
        <div className={s.container}>
          <Reveal>
            <SectionHead kicker="Good to know" title="Questions, answered" />
            <div className={s.faq}>
              {site.faqs.map((f, i) => (
                <details key={i} className={s.faqItem}>
                  <summary>{f.question}</summary>
                  <p className={s.faqAnswer}>{f.answer}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    ) : null,

    visit: (
      <section key="visit" id="visit" className={s.sectionAlt}>
        <div className={`${s.container} ${s.section}`}>
          <Reveal>
            <SectionHead kicker="Come see us" title={`Visit ${site.name}`} />
            <div className={`${s.visitGrid} ${st.booking_policy && bookHref ? s.visitGridPolicy : ''}`}>
              <div>
                <div className={s.visitColHead}>Find us</div>
                <div className={s.contactList}>
                  {st.phone && (
                    <a className={s.contactPhone} href={`tel:${st.phone.replace(/[^+\d]/g, '')}`}>{st.phone}</a>
                  )}
                  {st.address && (
                    <span className={s.contactAddress}>
                      {st.google_maps_url
                        ? <a href={st.google_maps_url} target="_blank" rel="noopener noreferrer">{st.address} ↗</a>
                        : st.address}
                    </span>
                  )}
                  {st.email && <a className={s.contactEmail} href={`mailto:${st.email}`}>{st.email}</a>}
                </div>
                {(st.instagram || st.facebook || st.yelp) && (
                  <div className={s.socialRow}>
                    {st.instagram && <a href={st.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
                    {st.facebook && <a href={st.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
                    {st.yelp && <a href={st.yelp} target="_blank" rel="noopener noreferrer">Yelp</a>}
                  </div>
                )}
              </div>
              <div>
                <div className={s.visitColHead}>Hours</div>
                {st.holiday_hours && <div className={s.holiday}>{st.holiday_hours}</div>}
                {hourRows.length > 0 && (
                  <table className={s.hoursTable}>
                    <tbody>
                      {hourRows.map((row) => (
                        <tr key={row.label} className={`${row.closed ? s.hoursClosed : ''} ${row.isToday ? s.hoursToday : ''}`}>
                          <td>{row.label}</td>
                          <td>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {st.booking_policy && bookHref && (
                <div className={s.policyCard}>
                  <div className={s.policyTitle}>Ready when you are.</div>
                  <p className={s.policyBody}>{st.booking_policy}</p>
                  <a href={bookHref} className={s.cta}>{bookLabel}</a>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    ),

    bookcta: bookHref ? (
      <section key="bookcta" className={s.bookBand}>
        <Reveal>
          <div className={s.bookBandOrnament} aria-hidden />
          <h2 className={s.bookBandTitle}>Ready when <em>you</em> are.</h2>
          <p className={s.bookBandSub}>Reserve your visit at {site.name}.</p>
          <a href={bookHref} className={`${s.cta} ${s.ctaLarge}`}>{bookLabel}</a>
        </Reveal>
      </section>
    ) : null,
  }

  return (
    <div
      className={s.page}
      style={vars}
      data-theme={selection.themeId}
      data-fonts={v.fonts}
      data-density={v.density}
      data-radius={v.radius}
      data-mode={v.mode}
    >
      <header className={s.header}>
        <div className={`${s.container} ${s.headerRow}`}>
          <a href="#" className={s.brand}>
            {st.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={st.logo_url} alt="" className={s.brandLogo} />
            )}
            {site.name}
          </a>
          <nav className={s.nav}>
            {nav.filter((n) => n.show).map((n) => (
              <a key={n.id} href={`#${n.id}`} className={s.navLink}>{n.label}</a>
            ))}
            {bookHref && <a href={bookHref} className={s.cta}>{bookLabel}</a>}
          </nav>
        </div>
      </header>

      {v.sectionOrder.map((id) => sections[id])}

      <footer className={s.footer}>
        <div className={s.footerName}>{site.name}</div>
        {(st.instagram || st.facebook || st.yelp) && (
          <div className={s.footerSocial}>
            {st.instagram && <a href={st.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
            {st.facebook && <a href={st.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
            {st.yelp && <a href={st.yelp} target="_blank" rel="noopener noreferrer">Yelp</a>}
          </div>
        )}
        <div className={s.footerCopy}>© {new Date().getFullYear()} {site.name}. All rights reserved.</div>
      </footer>
    </div>
  )
}

// ---------------------------------------------------------------------------

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className={s.sectionHead}>
      <div className={s.kicker}>{kicker}</div>
      <h2 className={s.sectionTitle}>{title}</h2>
    </div>
  )
}

function Img({ img, className, eager }: { img: GalleryImage; className?: string; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img.imageUrl}
      alt={img.alt}
      className={className}
      width={img.w}
      height={img.h}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
    />
  )
}

// ---------------------------------------------------------------------------
// Hero — four archetypes.
// ---------------------------------------------------------------------------

function Hero({
  site, heroImage, heroSides, bookHref, bookLabel, heroStyle,
}: {
  site: SiteData
  heroImage: GalleryImage
  heroSides: [GalleryImage, GalleryImage]
  bookHref: string | null
  bookLabel: string | null
  heroStyle: 'arch' | 'editorial' | 'veil' | 'split'
}) {
  const st = site.settings
  const heroLine1 = st.hero_line1 || 'Beauty, in'
  const heroLine2 = st.hero_line2 || 'every detail.'

  const title = (
    <h1 className={s.heroTitle}>
      {heroLine1} <em>{heroLine2}</em>
    </h1>
  )
  const desc = st.hero_description && <p className={s.heroDesc}>{st.hero_description}</p>
  const actions = (
    <div className={s.heroActions}>
      {bookHref && <a href={bookHref} className={`${s.cta} ${s.ctaLarge}`}>{bookLabel}</a>}
      {site.services.length > 0 && <a href="#services" className={s.heroSecondary}>See the menu</a>}
    </div>
  )
  const signature = st.signature_name && (
    <div className={s.signature}>
      <div className={s.signatureLabel}>Signature</div>
      <div className={s.signatureRow}>
        <span className={s.signatureName}>{st.signature_name}</span>
        {st.signature_price && <span className={s.signaturePrice}>{st.signature_price}</span>}
      </div>
    </div>
  )

  if (heroStyle === 'arch') {
    return (
      <section className={s.heroArch}>
        <div className={s.container}>
          <div className={s.heroEyebrow}>Welcome to {site.name}</div>
          {title}
          {desc}
          {actions}
          <div className={s.archRow}>
            <div className={`${s.archFrame} ${s.archSide}`}>
              <Img img={heroSides[0]} className={s.archImg} />
            </div>
            <div className={`${s.archFrame} ${s.archCenter}`}>
              <Img img={heroImage} className={s.archImg} eager />
              {signature}
            </div>
            <div className={`${s.archFrame} ${s.archSide}`}>
              <Img img={heroSides[1]} className={s.archImg} />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (heroStyle === 'editorial') {
    return (
      <section className={s.heroEd}>
        <div className={`${s.container} ${s.heroEdGrid}`}>
          <div className={s.heroEdLeft}>
            <div className={s.heroEdRule}>{site.name} — Nail Studio</div>
            {title}
            {desc}
            {actions}
          </div>
          <div className={s.heroEdMedia}>
            <Img img={heroImage} className={s.heroEdImg} eager />
            {signature}
          </div>
        </div>
      </section>
    )
  }

  if (heroStyle === 'veil') {
    return (
      <section className={s.heroVeil}>
        <div className={s.heroVeilMedia}>
          <Img img={heroImage} className={s.heroVeilImg} eager />
        </div>
        <div className={s.heroVeilCard}>
          <div className={s.heroEyebrow}>{site.name}</div>
          {title}
          {desc}
          {actions}
        </div>
      </section>
    )
  }

  // split
  return (
    <section className={s.hero}>
      <div className={`${s.container} ${s.heroGrid}`}>
        <div>
          <div className={s.heroEyebrow}>Welcome to {site.name}</div>
          {title}
          {desc}
          {actions}
        </div>
        <div className={s.heroImageWrap}>
          <Img img={heroImage} className={s.heroImage} eager />
          {signature}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Services — three treatments.
// ---------------------------------------------------------------------------

function Services({ services, styleAxis }: { services: SiteData['services']; styleAxis: 'menu' | 'ledger' | 'cards' }) {
  if (styleAxis === 'cards') {
    return (
      <div className={s.serviceCards}>
        {services.map((svc, i) => (
          <div key={i} className={s.serviceCard}>
            <div className={s.serviceName}>{svc.name}</div>
            {svc.note && <p className={s.serviceNote}>{svc.note}</p>}
            {svc.priceText && <span className={s.servicePrice}>{svc.priceText}</span>}
          </div>
        ))}
      </div>
    )
  }

  if (styleAxis === 'ledger') {
    return (
      <div className={s.ledger}>
        {services.map((svc, i) => (
          <div key={i} className={s.ledgerRow}>
            <span className={s.ledgerIndex}>{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span className={s.serviceName}>{svc.name}</span>
              {svc.note && <p className={s.serviceNote}>{svc.note}</p>}
            </span>
            {svc.priceText && <span className={s.ledgerPrice}>{svc.priceText}</span>}
          </div>
        ))}
      </div>
    )
  }

  // menu (fine-dining)
  return (
    <div className={s.menuList}>
      {services.map((svc, i) => (
        <div key={i} className={s.menuItem}>
          <div className={s.menuRow}>
            <span className={s.serviceName}>{svc.name}</span>
            <span className={s.menuDots} aria-hidden />
            {svc.priceText && <span className={s.servicePrice}>{svc.priceText}</span>}
          </div>
          {svc.note && <p className={s.serviceNote}>{svc.note}</p>}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Gallery — three treatments.
// ---------------------------------------------------------------------------

function Gallery({ items, styleAxis, siteName }: { items: GalleryImage[]; styleAxis: 'arch' | 'masonry' | 'film'; siteName: string }) {
  const cls = styleAxis === 'masonry' ? s.galleryMasonry : styleAxis === 'film' ? s.galleryFilm : s.galleryArches
  return (
    <div className={cls}>
      {items.map((g, i) => (
        <figure key={i} className={s.galleryItem}>
          <Img img={{ ...g, alt: g.alt || `${siteName} — gallery ${i + 1}` }} className={s.galleryImg} />
          {g.caption && <figcaption className={s.galleryCaption}>{g.caption}</figcaption>}
        </figure>
      ))}
    </div>
  )
}
