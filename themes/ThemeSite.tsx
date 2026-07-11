import type { CSSProperties } from 'react'
import type { SiteData, DayKey } from '@/lib/siteData'
import { DAY_KEYS } from '@/lib/siteData'
import type { ThemeSelection, SectionId } from './catalog'
import type { PaletteTokens } from '@/lib/palettes'
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

interface ThemeSiteProps {
  site: SiteData
  selection: ThemeSelection
  tokens: PaletteTokens
}

/**
 * The shared section engine (Website Builder v1). Every theme × variation ×
 * palette renders through THIS component: the variation config picks section
 * order + style axes (data-attributes → theme.module.css variants) and the
 * palette provides the --c-* tokens. Sections are pure functions of SiteData
 * slices and render only when their content exists. Adding a theme/variation
 * = a catalog entry; this file only grows when a look needs a NEW axis.
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

  const bookHref = site.bookingUrl || (st.phone ? `tel:${st.phone.replace(/[^+\d]/g, '')}` : null)
  const bookLabel = site.bookingUrl ? 'Book now' : st.phone ? 'Call to book' : null
  const todayKey = DAY_KEYS[(new Date().getDay() + 6) % 7]

  const nav: Array<{ id: string; label: string; show: boolean }> = [
    { id: 'services', label: 'Services', show: site.services.length > 0 },
    { id: 'gallery', label: 'Gallery', show: site.gallery.length > 0 },
    { id: 'team', label: 'Team', show: site.team.length > 0 },
    { id: 'reviews', label: 'Reviews', show: site.reviews.length > 0 },
    { id: 'visit', label: 'Visit', show: true },
  ]

  const sections: Record<SectionId, React.ReactNode> = {
    announcement: st.announcement ? (
      <div key="announcement" className={s.announce}>{st.announcement}</div>
    ) : null,

    hero: <Hero key="hero" site={site} bookHref={bookHref} bookLabel={bookLabel} heroStyle={v.hero} />,

    promotions: site.promotions.length > 0 ? (
      <section key="promotions" className={s.sectionAlt}>
        <div className={`${s.container} ${s.section}`}>
          <SectionHead kicker="Right now" title="Current offers" />
          <div className={s.promoGrid}>
            {site.promotions.map((p, i) => (
              <div key={i} className={s.promoCard}>
                <div className={s.promoTitle}>{p.title}</div>
                {p.body && <p className={s.promoBody}>{p.body}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    services: site.services.length > 0 ? (
      <section key="services" id="services" className={s.section}>
        <div className={s.container}>
          <SectionHead kicker="The menu" title="Services" />
          <Services services={site.services} styleAxis={v.services} />
        </div>
      </section>
    ) : null,

    gallery: site.gallery.length > 0 ? (
      <section key="gallery" id="gallery" className={s.sectionAlt}>
        <div className={`${s.container} ${s.section}`}>
          <SectionHead kicker="Our work" title="Gallery" />
          <div className={s.galleryGrid}>
            {site.gallery.map((g, i) => (
              <figure key={i} className={s.galleryItem} style={{ margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.imageUrl} alt={g.alt || `${site.name} work ${i + 1}`} className={s.galleryImg} loading="lazy" />
                {g.caption && <figcaption className={s.galleryCaption}>{g.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    team: site.team.length > 0 ? (
      <section key="team" id="team" className={s.section}>
        <div className={s.container}>
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
        </div>
      </section>
    ) : null,

    reviews: site.reviews.length > 0 ? (
      <section key="reviews" id="reviews" className={s.sectionAlt}>
        <div className={`${s.container} ${s.section}`}>
          <SectionHead kicker="Kind words" title="What clients say" />
          <div className={s.reviewGrid}>
            {site.reviews.map((r, i) => (
              <blockquote key={i} className={s.reviewCard}>
                <div className={s.stars} aria-label={`${r.rating} out of 5 stars`}>
                  {'★'.repeat(Math.max(1, Math.min(5, r.rating)))}
                </div>
                <p className={s.reviewQuote}>“{r.quote}”</p>
                <footer className={s.reviewAuthor}>— {r.author}</footer>
              </blockquote>
            ))}
          </div>
          {st.google_review_url && (
            <p style={{ marginTop: 20 }}>
              <a href={st.google_review_url} target="_blank" rel="noopener noreferrer" className={s.heroSecondary}>
                Read more reviews on Google
              </a>
            </p>
          )}
        </div>
      </section>
    ) : null,

    faqs: site.faqs.length > 0 ? (
      <section key="faqs" className={s.section}>
        <div className={s.container}>
          <SectionHead kicker="Good to know" title="Questions, answered" />
          <div className={s.faq}>
            {site.faqs.map((f, i) => (
              <details key={i} className={s.faqItem}>
                <summary>{f.question}</summary>
                <p className={s.faqAnswer}>{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    visit: (
      <section key="visit" id="visit" className={s.sectionAlt}>
        <div className={`${s.container} ${s.section}`}>
          <SectionHead kicker="Come see us" title={`Visit ${site.name}`} />
          <div className={s.visitGrid}>
            <div>
              <div className={s.contactList}>
                {st.address && (
                  <span>
                    {st.google_maps_url
                      ? <a href={st.google_maps_url} target="_blank" rel="noopener noreferrer">{st.address}</a>
                      : st.address}
                  </span>
                )}
                {st.phone && <span><a href={`tel:${st.phone.replace(/[^+\d]/g, '')}`}>{st.phone}</a></span>}
                {st.email && <span><a href={`mailto:${st.email}`}>{st.email}</a></span>}
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
              {st.holiday_hours && <div className={s.holiday}>{st.holiday_hours}</div>}
              {site.hours && (
                <table className={s.hoursTable}>
                  <tbody>
                    {DAY_KEYS.map((day) => {
                      const d = site.hours![day]
                      return (
                        <tr key={day} className={`${d.closed ? s.hoursClosed : ''} ${day === todayKey ? s.hoursToday : ''}`}>
                          <td>{DAY_LABELS[day]}</td>
                          <td>{d.closed ? 'Closed' : `${fmtTime(d.open)} – ${fmtTime(d.close)}`}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </section>
    ),

    bookcta: bookHref ? (
      <section key="bookcta" className={s.bookBand}>
        <h2 className={s.bookBandTitle}>Ready when you are.</h2>
        <p className={s.bookBandSub}>Book your visit at {site.name} today.</p>
        <a href={bookHref} className={s.cta}>{bookLabel}</a>
      </section>
    ) : null,
  }

  return (
    <div
      className={s.page}
      style={vars}
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
        © {new Date().getFullYear()} {site.name}. All rights reserved.
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

function Hero({
  site, bookHref, bookLabel, heroStyle,
}: { site: SiteData; bookHref: string | null; bookLabel: string | null; heroStyle: 'split' | 'centered' | 'banner' }) {
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
      {bookHref && <a href={bookHref} className={s.cta}>{bookLabel}</a>}
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

  if (heroStyle === 'banner') {
    return (
      <section className={s.heroBanner}>
        <div className={s.heroBannerMedia}>
          {st.hero_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={st.hero_image_url} alt="" />
          ) : (
            <div className={s.heroBannerFallback} aria-hidden />
          )}
        </div>
        <div className={s.heroBannerInner}>
          {title}
          {desc}
          {actions}
          {st.signature_name && <div className={`${s.signature} ${s.signatureInline}`}>
            <div className={s.signatureLabel}>Signature</div>
            <div className={s.signatureRow}>
              <span className={s.signatureName}>{st.signature_name}</span>
              {st.signature_price && <span className={s.signaturePrice}>{st.signature_price}</span>}
            </div>
          </div>}
        </div>
      </section>
    )
  }

  if (heroStyle === 'centered') {
    return (
      <section className={`${s.hero} ${s.heroCentered}`}>
        <div className={s.container}>
          {title}
          {desc}
          {actions}
          <div className={`${s.heroImageWrap} ${s.heroCenteredImage}`}>
            {st.hero_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={st.hero_image_url} alt={site.name} className={s.heroImage} />
            ) : (
              <div className={s.heroImageFallback} aria-hidden />
            )}
            {signature}
          </div>
        </div>
      </section>
    )
  }

  // split (default)
  return (
    <section className={s.hero}>
      <div className={`${s.container} ${s.heroGrid}`}>
        <div>
          {title}
          {desc}
          {actions}
        </div>
        <div className={s.heroImageWrap}>
          {st.hero_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={st.hero_image_url} alt={site.name} className={s.heroImage} />
          ) : (
            <div className={s.heroImageFallback} aria-hidden />
          )}
          {signature}
        </div>
      </div>
    </section>
  )
}

function Services({ services, styleAxis }: { services: SiteData['services']; styleAxis: 'dotted' | 'cards' | 'rows' }) {
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
  const rows = (
    <>
      {services.map((svc, i) => (
        <div key={i}>
          <div className={s.serviceRow}>
            <span className={s.serviceName}>{svc.name}</span>
            {styleAxis === 'dotted' ? <span className={s.serviceDots} aria-hidden /> : <span style={{ flex: 1 }} />}
            {svc.priceText && <span className={s.servicePrice}>{svc.priceText}</span>}
          </div>
          {svc.note && <p className={s.serviceNote}>{svc.note}</p>}
        </div>
      ))}
    </>
  )
  return <div className={styleAxis === 'dotted' ? s.serviceListDotted : s.serviceRows}>{rows}</div>
}
