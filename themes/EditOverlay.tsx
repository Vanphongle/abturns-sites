'use client'

import { useEffect } from 'react'

/**
 * Click-to-edit bridge. Mounted ONLY on token-gated previews with ?edit=1
 * (the POS editor iframe). Every [data-edit] element gets a hover outline
 * and its clicks become postMessages the editor turns into field forms.
 * Ordinary navigation is suppressed so the booking CTA etc. don't navigate
 * away mid-edit. No payload beyond the target name ever crosses the bridge.
 */
export default function EditOverlay() {
  useEffect(() => {
    document.documentElement.setAttribute('data-edit-mode', '1')

    const style = document.createElement('style')
    style.textContent = `
      [data-edit-mode] [data-edit] { cursor: pointer !important; }
      [data-edit-mode] [data-edit]:hover {
        outline: 2px dashed rgba(59, 130, 246, 0.9) !important;
        outline-offset: 4px !important;
        border-radius: 4px;
      }
    `
    document.head.appendChild(style)

    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest?.('[data-edit]') as HTMLElement | null
      e.preventDefault()
      e.stopPropagation()
      if (!el) return
      window.parent?.postMessage({ type: 'abts:edit', target: el.getAttribute('data-edit') }, '*')
    }
    document.addEventListener('click', onClick, true)

    return () => {
      document.documentElement.removeAttribute('data-edit-mode')
      style.remove()
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return null
}
