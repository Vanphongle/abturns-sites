import type { ComponentType } from 'react'
import type { SiteData } from '@/lib/siteData'
import AuroraTheme from './aurora/AuroraTheme'

/**
 * Theme registry — a theme is ONE component receiving the SiteData contract.
 * Stock themes live here; future Claude-generated bespoke themes are one file
 * each, registered under the site's settings.theme key. A theme file must
 * typecheck against SiteData or it doesn't merge — that's the safety gate
 * that keeps one bad theme from breaking every site.
 */
export type ThemeComponent = ComponentType<{ site: SiteData }>

const THEMES: Record<string, ThemeComponent> = {
  aurora: AuroraTheme,
}

export function resolveTheme(key: string | undefined): ThemeComponent {
  return THEMES[key || 'aurora'] ?? THEMES.aurora
}
