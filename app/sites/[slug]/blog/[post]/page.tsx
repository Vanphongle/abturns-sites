import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'
import { getSitePost } from '@/lib/siteData'
import { resolveSelection } from '@/themes/catalog'
import { getPalette, resolveTokens } from '@/lib/palettes'
import { markdownToHtml } from '@/lib/markdown'
import s from '@/themes/theme.module.css'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string; post: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug, post } = await props.params
  const data = await getSitePost(decodeURIComponent(slug), decodeURIComponent(post))
  if (!data) return { title: 'Not found', robots: { index: false } }
  return {
    title: data.post.seoTitle || `${data.post.title} — ${data.site.name}`,
    description: data.post.seoDescription || data.post.excerpt || undefined,
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function BlogPost(props: Props) {
  const { slug, post: postSlug } = await props.params
  const data = await getSitePost(decodeURIComponent(slug), decodeURIComponent(postSlug))
  if (!data) notFound()
  const { site, post } = data

  const selection = resolveSelection(site.theme_id, site.variation_id)
  const paletteId = (site.palette as { id?: string } | null)?.id ?? selection.theme.defaultPaletteId
  const tokens = resolveTokens(getPalette(paletteId), selection.variation.mode)
  const vars = {
    '--c-primary': tokens.primary,
    '--c-accent': tokens.accent,
    '--c-bg': tokens.bg,
    '--c-ink': tokens.ink,
  } as CSSProperties

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.coverImageUrl ? { image: post.coverImageUrl } : {}),
    author: { '@type': 'Organization', name: site.name },
    publisher: { '@type': 'Organization', name: site.name },
  }

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <header className={s.header}>
        <div className={`${s.container} ${s.headerRow}`}>
          <a href={`${site.basePath}/`} className={s.brand}>{site.name}</a>
          <nav className={s.nav}>
            <a href={`${site.basePath}/blog`} className={s.navLink}>Journal</a>
            <a href={`${site.basePath}/`} className={s.navLink}>Home</a>
          </nav>
        </div>
      </header>

      <article className={s.section}>
        <div className={`${s.container} ${s.postArticle}`}>
          {post.publishedAt && <div className={s.postDate}>{fmtDate(post.publishedAt)}</div>}
          <h1 className={s.postHeading}>{post.title}</h1>
          {post.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImageUrl} alt="" className={s.postCover} />
          )}
          <div className={s.prose} dangerouslySetInnerHTML={{ __html: markdownToHtml(post.bodyMd) }} />
          <a href={`${site.basePath}/blog`} className={s.textLink}>← Back to the journal</a>
        </div>
      </article>

      <footer className={s.footer}>
        <div className={s.footerName}>{site.name}</div>
        <div className={s.footerCopy}>© {new Date().getFullYear()} {site.name}. All rights reserved.</div>
      </footer>
    </div>
  )
}
