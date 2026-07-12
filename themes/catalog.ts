// Theme catalog — Website Builder v1 luxury lineup (3 themes × 3 variations).
// A THEME is a family of looks; a VARIATION is a concrete configuration of
// the shared section engine (ThemeSite.tsx): display face, density, hero
// archetype, section treatments, light/dark, stock-photo mood, section
// order. Adding a theme or variation = adding an entry here (plus CSS
// variant rules if it needs a new axis) — the builder UI and renderer both
// read this catalog.
//
// The POS builder keeps a MIRROR of ids/labels in
// src/features/website/lib/themeCatalog.ts — update both together.
//
// The families:
//   maison  — Parisian atelier: Cormorant serif, ivory + gold hairlines,
//             arch-cropped imagery, fine-dining service menu.
//   atelier — fashion editorial: oversized Archivo display, stark contrast,
//             numbered service ledger, masonry gallery.
//   riviera — resort spa: full-bleed veil hero, soft glass cards,
//             filmstrip gallery, rounded serenity.

import type { StockMood } from '@/lib/stockPhotos'

export type SectionId =
  | 'announcement'
  | 'hero'
  | 'promotions'
  | 'philosophy'
  | 'services'
  | 'gallery'
  | 'team'
  | 'reviews'
  | 'journal'
  | 'faqs'
  | 'visit'
  | 'bookcta'

export interface VariationConfig {
  label: string
  /** Display-face: Cormorant serif / Archivo editorial / Jost geometric. */
  fonts: 'serif' | 'editorial' | 'geo'
  /** Section vertical rhythm. */
  density: 'airy' | 'regular' | 'compact'
  /** Hero archetype: arch triptych / asymmetric editorial / full-bleed veil / split. */
  hero: 'arch' | 'editorial' | 'veil' | 'split'
  /** Services treatment: fine-dining menu / numbered ledger / soft cards. */
  services: 'menu' | 'ledger' | 'cards'
  /** Gallery treatment: arch row / masonry columns / filmstrip scroll. */
  gallery: 'arch' | 'masonry' | 'film'
  /** Corner rounding personality. */
  radius: 'soft' | 'round' | 'sharp'
  mode: 'light' | 'dark'
  /** Which built-in sample-photo set fills empty hero/gallery slots. */
  stockMood: StockMood
  sectionOrder: SectionId[]
}

export interface ThemeConfig {
  label: string
  description: string
  defaultPaletteId: string
  variations: Record<string, VariationConfig>
}

const STANDARD_ORDER: SectionId[] = [
  'announcement', 'hero', 'promotions', 'services', 'gallery', 'philosophy', 'team', 'reviews', 'journal', 'faqs', 'visit', 'bookcta',
]

export const THEME_CATALOG: Record<string, ThemeConfig> = {
  maison: {
    label: 'Maison',
    description: 'Parisian atelier — serif elegance, ivory and gold.',
    defaultPaletteId: 'classic',
    variations: {
      ivoire: {
        label: 'Ivoire',
        fonts: 'serif', density: 'airy', hero: 'arch', services: 'menu', gallery: 'arch',
        radius: 'soft', mode: 'light', stockMood: 'warm',
        sectionOrder: ['announcement', 'hero', 'services', 'gallery', 'philosophy', 'promotions', 'reviews', 'team', 'journal', 'faqs', 'visit', 'bookcta'],
      },
      noir: {
        label: 'Noir',
        fonts: 'serif', density: 'airy', hero: 'arch', services: 'menu', gallery: 'arch',
        radius: 'soft', mode: 'dark', stockMood: 'noir',
        sectionOrder: ['announcement', 'hero', 'services', 'gallery', 'philosophy', 'reviews', 'promotions', 'team', 'journal', 'faqs', 'visit', 'bookcta'],
      },
      blush: {
        label: 'Blush',
        fonts: 'serif', density: 'regular', hero: 'split', services: 'menu', gallery: 'arch',
        radius: 'round', mode: 'light', stockMood: 'warm',
        sectionOrder: STANDARD_ORDER,
      },
    },
  },
  atelier: {
    label: 'Atelier',
    description: 'Fashion editorial — bold type, stark and modern.',
    defaultPaletteId: 'midnight',
    variations: {
      gallery: {
        label: 'Gallery',
        fonts: 'editorial', density: 'regular', hero: 'editorial', services: 'ledger', gallery: 'masonry',
        radius: 'sharp', mode: 'light', stockMood: 'bright',
        sectionOrder: ['announcement', 'hero', 'gallery', 'philosophy', 'services', 'promotions', 'team', 'reviews', 'journal', 'faqs', 'visit', 'bookcta'],
      },
      mode: {
        label: 'Mode',
        fonts: 'editorial', density: 'regular', hero: 'editorial', services: 'ledger', gallery: 'masonry',
        radius: 'sharp', mode: 'dark', stockMood: 'noir',
        sectionOrder: ['announcement', 'hero', 'services', 'gallery', 'philosophy', 'reviews', 'promotions', 'team', 'journal', 'faqs', 'visit', 'bookcta'],
      },
      linen: {
        label: 'Linen',
        fonts: 'editorial', density: 'compact', hero: 'split', services: 'ledger', gallery: 'masonry',
        radius: 'sharp', mode: 'light', stockMood: 'bright',
        sectionOrder: STANDARD_ORDER,
      },
    },
  },
  riviera: {
    label: 'Riviera',
    description: 'Resort spa — serene, airy, sun-washed calm.',
    defaultPaletteId: 'emerald',
    variations: {
      azure: {
        label: 'Azure',
        fonts: 'geo', density: 'airy', hero: 'veil', services: 'cards', gallery: 'film',
        radius: 'round', mode: 'light', stockMood: 'serene',
        sectionOrder: ['announcement', 'hero', 'promotions', 'services', 'gallery', 'philosophy', 'team', 'reviews', 'journal', 'faqs', 'visit', 'bookcta'],
      },
      dusk: {
        label: 'Dusk',
        fonts: 'geo', density: 'airy', hero: 'veil', services: 'cards', gallery: 'film',
        radius: 'round', mode: 'dark', stockMood: 'serene',
        sectionOrder: ['announcement', 'hero', 'services', 'gallery', 'philosophy', 'reviews', 'promotions', 'team', 'journal', 'faqs', 'visit', 'bookcta'],
      },
      sable: {
        label: 'Sable',
        fonts: 'geo', density: 'regular', hero: 'split', services: 'cards', gallery: 'film',
        radius: 'round', mode: 'light', stockMood: 'warm',
        sectionOrder: STANDARD_ORDER,
      },
    },
  },
}

export const DEFAULT_THEME_ID = 'maison'
export const DEFAULT_VARIATION_ID = 'ivoire'

/** Pre-luxury ids (and the pre-builder 'aurora' key) → nearest new family. */
const LEGACY_THEME_MAP: Record<string, string> = {
  aurora: 'maison',
  luxe: 'maison',
  'modern-minimal': 'atelier',
  fresh: 'riviera',
}

export interface ThemeSelection {
  themeId: string
  variationId: string
  variation: VariationConfig
  theme: ThemeConfig
}

/**
 * Resolve a (theme_id, variation_id) pair to a concrete config with safe
 * fallbacks. Legacy ids map to the nearest luxury family so any site that
 * predates the lineup keeps rendering.
 */
export function resolveSelection(themeId?: string | null, variationId?: string | null): ThemeSelection {
  const mapped = themeId ? (LEGACY_THEME_MAP[themeId] ?? themeId) : DEFAULT_THEME_ID
  const theme = THEME_CATALOG[mapped] ?? THEME_CATALOG[DEFAULT_THEME_ID]
  const resolvedThemeId = THEME_CATALOG[mapped] ? mapped : DEFAULT_THEME_ID
  const vid = variationId && theme.variations[variationId]
    ? variationId
    : resolvedThemeId === DEFAULT_THEME_ID
      ? DEFAULT_VARIATION_ID
      : Object.keys(theme.variations)[0]
  return { themeId: resolvedThemeId, variationId: vid, variation: theme.variations[vid], theme }
}
