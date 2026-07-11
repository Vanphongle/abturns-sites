import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'
import { getSitePosts } from '@/lib/siteData'
import { resolveSelection } from '@/themes/catalog'
import { getPalette, resolveTokens } from '@/lib/palettes'
import s from '@/themes/theme.module.css'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const data = await getSitePosts(decodeURIComponent(slug))
  if (!data) return { title: 'Not found', robots: { index: false } }
  return {
    title: `Journal — ${data.site.name}`,
    description: `Nail care advice and notes from ${data.site.name}.`,
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogIndex(props: Props) {
  const { slug } = await props.params
  const data = await getSitePosts(decodeURIComponent(slug))
  if (!data) notFound()
  const { site, posts } = data

  const selection = resolveSelection(site.theme_id, site.variation_id)
  const paletteId = (site.palette as { id?: string } | null)?.id ?? selection.theme.defaultPaletteId
  const tokens = resolveTokens(getPalette(paletteId), selection.variation.mode)
  const vars = {
    '--c-primary': tokens.primary,
    '--c-accent': tokens.accent,
    '--c-bg': tokens.bg,
    '--c-ink': tokens.ink,
  } as CSSProperties

  return (
    <div
      className={s.page}
      style={vars}
      data-theme={selection.themeId}
      data-fonts={selection.variation.fonts}
      data-density="regular"
      data-radius={selection.variation.radius}
      data-mode={selection.variation.mode}
    >
      <header className={s.header}>
        <div className={`${s.container} ${s.headerRow}`}>
          <a href={`${site.basePath}/`} className={s.brand}>{site.name}</a>
          <nav className={s.nav}>
            <a href={`${site.basePath}/`} className={s.navLink}>Home</a>
          </nav>
        </div>
      </header>

      <section className={s.section}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.kicker}>Notes from the salon</div>
            <h1 className={s.sectionTitle}>Journal</h1>
          </div>

          <div className={s.postList}>
            {posts.map((p) => (
              <a key={p.slug} href={`${site.basePath}/blog/${p.slug}`} className={s.postCard}>
                {p.publishedAt && <div className={s.postDate}>{fmtDate(p.publishedAt)}</div>}
                <h2 className={s.postTitle}>{p.title}</h2>
                {p.excerpt && <p className={s.postExcerpt}>{p.excerpt}</p>}
                <span className={s.postMore}>Read on</span>
              </a>
            ))}
            {posts.length === 0 && <p className={s.postExcerpt}>Nothing here yet.</p>}
          </div>
        </div>
      </section>

      <footer className={s.footer}>
        <div className={s.footerName}>{site.name}</div>
        <div className={s.footerCopy}>© {new Date().getFullYear()} {site.name}. All rights reserved.</div>
      </footer>
    </div>
  )
}
