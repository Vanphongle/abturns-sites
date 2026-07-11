import type { CSSProperties } from 'react'
import type { SiteData, DayKey } from '@/lib/siteData'
import { DAY_KEYS } from '@/lib/siteData'
import s from './aurora.module.css'

const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

/** '14:30' → '2:30 PM' (hours render in customer-friendly 12h). */
function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  if (!Number.isFinite(h)) return hhmm
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return m ? `${hour12}:${String(m).padStart(2, '0')} ${suffix}` : `${hour12} ${suffix}`
}

/**
 * Aurora — stock theme #1. A theme is a pure function of SiteData: sections
 * render only when their content exists, design tokens come from
 * settings.design_* (defaults below), and the ONLY outbound links are the
 * salon's own (booking, maps, socials). No platform branding anywhere.
 */
export default function AuroraTheme({ site }: { site: SiteData }) {
  const st = site.settings
  const tokens = {
    '--c-primary': st.design_primary || '#8a5a44',
    '--c-accent': st.design_accent || '#d9a441',
    '--c-bg': st.design_bg || '#faf7f3',
    '--c-ink': st.design_ink || '#221c17',
  } as CSSProperties

  const bookHref = site.bookingUrl || (st.phone ? `tel:${st.phone.replace(/[^+\d]/g, '')}` : null)
  const bookLabel = site.bookingUrl ? 'Book now' : st.phone ? 'Call to book' : null

  const heroLine1 = st.hero_line1 || 'Beauty, in'
  const heroLine2 = st.hero_line2 || 'every detail.'

  // Today's row highlight uses the VISITOR's local weekday — good enough for a
  // local business whose visitors are overwhelmingly in the salon's timezone.
  const todayKey = DAY_KEYS[(new Date().getDay() + 6) % 7]

  const nav: Array<{ id: string; label: string; show: boolean }> = [
    { id: 'services', label: 'Services', show: site.services.length > 0 },
    { id: 'gallery', label: 'Gallery', show: site.gallery.length > 0 },
    { id: 'team', label: 'Team', show: site.team.length > 0 },
    { id: 'reviews', label: 'Reviews', show: site.reviews.length > 0 },
    { id: 'visit', label: 'Visit', show: true },
  ]

  return (
    <div className={s.page} style={tokens}>
      {st.announcement && <div className={s.announce}>{st.announcement}</div>}

      <header className={s.header}>
        <div className={`${s.container} ${s.headerRow}`}>
          <a href="#" className={s.brand}>{site.name}</a>
          <nav className={s.nav}>
            {nav.filter((n) => n.show).map((n) => (
              <a key={n.id} href={`#${n.id}`} className={s.navLink}>{n.label}</a>
            ))}
            {bookHref && <a href={bookHref} className={s.cta}>{bookLabel}</a>}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className={s.hero}>
        <div className={`${s.container} ${s.heroGrid}`}>
          <div>
            <h1 className={s.heroTitle}>
              {heroLine1} <em>{heroLine2}</em>
            </h1>
            {st.hero_description && <p className={s.heroDesc}>{st.hero_description}</p>}
            <div className={s.heroActions}>
              {bookHref && <a href={bookHref} className={s.cta}>{bookLabel}</a>}
              {site.services.length > 0 && (
                <a href="#services" className={s.heroSecondary}>See the menu</a>
              )}
            </div>
          </div>
          <div className={s.heroImageWrap}>
            {st.hero_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={st.hero_image_url} alt={site.name} className={s.heroImage} />
            ) : (
              <div className={s.heroImageFallback} aria-hidden />
            )}
            {st.signature_name && (
              <div className={s.signature}>
                <div className={s.signatureLabel}>Signature</div>
                <div className={s.signatureRow}>
                  <span className={s.signatureName}>{st.signature_name}</span>
                  {st.signature_price && <span className={s.signaturePrice}>{st.signature_price}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Promotions */}
      {site.promotions.length > 0 && (
        <section className={s.sectionAlt}>
          <div className={`${s.container} ${s.section}`}>
            <div className={s.sectionHead}>
              <div className={s.kicker}>Right now</div>
              <h2 className={s.sectionTitle}>Current offers</h2>
            </div>
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
      )}

      {/* Services */}
      {site.services.length > 0 && (
        <section id="services" className={s.section}>
          <div className={s.container}>
            <div className={s.sectionHead}>
              <div className={s.kicker}>The menu</div>
              <h2 className={s.sectionTitle}>Services</h2>
            </div>
            <div className={s.serviceList}>
              {site.services.map((svc, i) => (
                <div key={i}>
                  <div className={s.serviceRow}>
                    <span className={s.serviceName}>{svc.name}</span>
                    <span className={s.serviceDots} aria-hidden />
                    {svc.priceText && <span className={s.servicePrice}>{svc.priceText}</span>}
                  </div>
                  {svc.note && <p className={s.serviceNote}>{svc.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {site.gallery.length > 0 && (
        <section id="gallery" className={s.sectionAlt}>
          <div className={`${s.container} ${s.section}`}>
            <div className={s.sectionHead}>
              <div className={s.kicker}>Our work</div>
              <h2 className={s.sectionTitle}>Gallery</h2>
            </div>
            <div className={s.galleryGrid}>
              {site.gallery.map((g, i) => (
                <figure key={i} className={s.galleryItem}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.imageUrl} alt={g.alt || `${site.name} work ${i + 1}`} className={s.galleryImg} loading="lazy" />
                  {g.caption && <figcaption className={s.galleryCaption}>{g.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team */}
      {site.team.length > 0 && (
        <section id="team" className={s.section}>
          <div className={s.container}>
            <div className={s.sectionHead}>
              <div className={s.kicker}>The people</div>
              <h2 className={s.sectionTitle}>Meet the team</h2>
            </div>
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
      )}

      {/* Reviews */}
      {site.reviews.length > 0 && (
        <section id="reviews" className={s.sectionAlt}>
          <div className={`${s.container} ${s.section}`}>
            <div className={s.sectionHead}>
              <div className={s.kicker}>Kind words</div>
              <h2 className={s.sectionTitle}>What clients say</h2>
            </div>
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
      )}

      {/* FAQs */}
      {site.faqs.length > 0 && (
        <section className={s.section}>
          <div className={s.container}>
            <div className={s.sectionHead}>
              <div className={s.kicker}>Good to know</div>
              <h2 className={s.sectionTitle}>Questions, answered</h2>
            </div>
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
      )}

      {/* Visit — hours + contact */}
      <section id="visit" className={s.sectionAlt}>
        <div className={`${s.container} ${s.section}`}>
          <div className={s.sectionHead}>
            <div className={s.kicker}>Come see us</div>
            <h2 className={s.sectionTitle}>Visit {site.name}</h2>
          </div>
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
              {(st.instagram || st.facebook) && (
                <div className={s.socialRow}>
                  {st.instagram && <a href={st.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
                  {st.facebook && <a href={st.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
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

      {/* Book band */}
      {bookHref && (
        <section className={s.bookBand}>
          <h2 className={s.bookBandTitle}>Ready when you are.</h2>
          <p className={s.bookBandSub}>Book your visit at {site.name} today.</p>
          <a href={bookHref} className={s.cta}>{bookLabel}</a>
        </section>
      )}

      <footer className={s.footer}>
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </footer>
    </div>
  )
}
