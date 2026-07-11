'use client'

import { useState } from 'react'
import s from './theme.module.css'

interface MobileNavProps {
  links: Array<{ id: string; label: string }>
  blogHref?: string | null
  bookHref: string | null
  bookLabel: string | null
}

/**
 * Phone-width navigation. The desktop header hides its inline links under
 * 760px; this hamburger opens a simple panel with the section links + the
 * booking CTA. Pure useState — no portal, no dependency.
 */
export default function MobileNav({ links, blogHref, bookHref, bookLabel }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className={s.mobileNav}>
      <button
        type="button"
        className={s.burger}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span data-open={open || undefined} />
        <span data-open={open || undefined} />
        <span data-open={open || undefined} />
      </button>
      {open && (
        <div className={s.mobileMenu}>
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} className={s.mobileLink} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          {blogHref && (
            <a href={blogHref} className={s.mobileLink} onClick={() => setOpen(false)}>Journal</a>
          )}
          {bookHref && (
            <a href={bookHref} className={s.cta} onClick={() => setOpen(false)}>
              {bookLabel}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
