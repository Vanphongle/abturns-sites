// Theme catalog — Website Builder v1 (3 themes × 3 variations).
// A THEME is a family of looks; a VARIATION is a concrete configuration of
// the shared section engine (ThemeSite.tsx): fonts, density, hero layout,
// section styling flags, light/dark, section order. Adding a theme or
// variation = adding an entry here (plus CSS variant classes if it needs a
// new axis) — the builder UI and renderer both read this catalog.
//
// The POS builder keeps a MIRROR of ids/labels in
// src/features/website/lib/themeCatalog.ts — update both together.

export type SectionId =
  | 'announcement'
  | 'hero'
  | 'promotions'
  | 'services'
  | 'gallery'
  | 'team'
  | 'reviews'
  | 'faqs'
  | 'visit'
  | 'bookcta'

export interface VariationConfig {
  label: string
  /** Display-face treatment: serif display / all-sans / uppercase editorial. */
  fonts: 'serif' | 'sans' | 'editorial'
  /** Section vertical rhythm. */
  density: 'airy' | 'regular' | 'compact'
  /** Hero arrangement. */
  hero: 'split' | 'centered' | 'banner'
  /** Services list treatment. */
  services: 'dotted' | 'cards' | 'rows'
  /** Corner rounding personality. */
  radius: 'soft' | 'round' | 'sharp'
  mode: 'light' | 'dark'
  sectionOrder: SectionId[]
}

export interface ThemeConfig {
  label: string
  description: string
  defaultPaletteId: string
  variations: Record<string, VariationConfig>
}

const STANDARD_ORDER: SectionId[] = [
  'announcement', 'hero', 'promotions', 'services', 'gallery', 'team', 'reviews', 'faqs', 'visit', 'bookcta',
]

export const THEME_CATALOG: Record<string, ThemeConfig> = {
  'modern-minimal': {
    label: 'Modern Minimal',
    description: 'Clean, whitespace, photo-forward.',
    defaultPaletteId: 'midnight',
    variations: {
      light: {
        label: 'Light',
        fonts: 'sans', density: 'airy', hero: 'centered', services: 'rows', radius: 'soft', mode: 'light',
        sectionOrder: STANDARD_ORDER,
      },
      bold: {
        label: 'Bold',
        fonts: 'sans', density: 'compact', hero: 'banner', services: 'cards', radius: 'sharp', mode: 'light',
        sectionOrder: ['announcement', 'hero', 'services', 'promotions', 'gallery', 'reviews', 'team', 'faqs', 'visit', 'bookcta'],
      },
      editorial: {
        label: 'Editorial',
        fonts: 'editorial', density: 'regular', hero: 'split', services: 'rows', radius: 'sharp', mode: 'light',
        sectionOrder: ['announcement', 'hero', 'gallery', 'services', 'promotions', 'team', 'reviews', 'faqs', 'visit', 'bookcta'],
      },
    },
  },
  luxe: {
    label: 'Luxe',
    description: 'Spa-calm, serif elegance.',
    defaultPaletteId: 'rose-quartz',
    variations: {
      noir: {
        label: 'Noir',
        fonts: 'serif', density: 'airy', hero: 'centered', services: 'dotted', radius: 'soft', mode: 'dark',
        sectionOrder: ['announcement', 'hero', 'services', 'gallery', 'promotions', 'reviews', 'team', 'faqs', 'visit', 'bookcta'],
      },
      champagne: {
        label: 'Champagne',
        fonts: 'serif', density: 'regular', hero: 'split', services: 'dotted', radius: 'round', mode: 'light',
        sectionOrder: STANDARD_ORDER,
      },
      rose: {
        label: 'Rose',
        fonts: 'serif', density: 'airy', hero: 'banner', services: 'cards', radius: 'round', mode: 'light',
        sectionOrder: ['announcement', 'hero', 'gallery', 'promotions', 'services', 'reviews', 'team', 'faqs', 'visit', 'bookcta'],
      },
    },
  },
  fresh: {
    label: 'Fresh',
    description: 'Rounded, friendly, vibrant.',
    defaultPaletteId: 'emerald',
    variations: {
      pastel: {
        label: 'Pastel',
        fonts: 'sans', density: 'regular', hero: 'split', services: 'cards', radius: 'round', mode: 'light',
        sectionOrder: STANDARD_ORDER,
      },
      sunset: {
        label: 'Sunset',
        fonts: 'sans', density: 'regular', hero: 'banner', services: 'cards', radius: 'round', mode: 'light',
        sectionOrder: ['announcement', 'hero', 'promotions', 'gallery', 'services', 'team', 'reviews', 'faqs', 'visit', 'bookcta'],
      },
      mono: {
        label: 'Mono',
        fonts: 'editorial', density: 'compact', hero: 'centered', services: 'rows', radius: 'sharp', mode: 'dark',
        sectionOrder: ['announcement', 'hero', 'services', 'reviews', 'gallery', 'team', 'faqs', 'visit', 'bookcta'],
      },
    },
  },
}

export const DEFAULT_THEME_ID = 'luxe'
export const DEFAULT_VARIATION_ID = 'champagne'

export interface ThemeSelection {
  themeId: string
  variationId: string
  variation: VariationConfig
  theme: ThemeConfig
}

/**
 * Resolve a (theme_id, variation_id) pair to a concrete config with safe
 * fallbacks. Legacy: the pre-builder 'aurora' theme key (and null) maps to
 * luxe/champagne — the closest look to the original single template — so
 * existing sites (demo-salon) keep rendering.
 */
export function resolveSelection(themeId?: string | null, variationId?: string | null): ThemeSelection {
  const tid = !themeId || themeId === 'aurora' ? DEFAULT_THEME_ID : themeId
  const theme = THEME_CATALOG[tid] ?? THEME_CATALOG[DEFAULT_THEME_ID]
  const resolvedThemeId = THEME_CATALOG[tid] ? tid : DEFAULT_THEME_ID
  const vid = variationId && theme.variations[variationId]
    ? variationId
    : resolvedThemeId === DEFAULT_THEME_ID
      ? DEFAULT_VARIATION_ID
      : Object.keys(theme.variations)[0]
  return { themeId: resolvedThemeId, variationId: vid, variation: theme.variations[vid], theme }
}
