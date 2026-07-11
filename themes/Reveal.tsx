'use client'

import { useEffect, useRef } from 'react'

/**
 * Scroll-reveal, progressive-enhancement style. The server HTML is fully
 * visible (SEO / no-JS / LCP safe); on mount, elements still BELOW the fold
 * are hidden and revealed as they scroll in. Above-the-fold content never
 * hides, so there is no flash and no CLS. Respects prefers-reduced-motion.
 */
export default function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    // Only elements comfortably below the viewport participate.
    if (rect.top <= window.innerHeight * 0.92) return
    el.setAttribute('data-hidden', '')
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.removeAttribute('data-hidden')
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} data-reveal style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}
