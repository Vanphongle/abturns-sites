// Palette presets — Website Builder v1 (fixed presets only; custom = v2).
// Four tokens drive every theme: primary (CTAs/links), accent (stars/badges),
// bg (page), ink (text). Dark variations (e.g. Luxe Noir) keep the palette's
// primary/accent but swap bg/ink for fixed dark neutrals — see resolveTokens.

export interface PaletteTokens {
  primary: string
  accent: string
  bg: string
  ink: string
}

export interface PalettePreset extends PaletteTokens {
  id: string
  label: string
}

export const PALETTES: PalettePreset[] = [
  { id: 'rose-quartz', label: 'Rose Quartz', primary: '#b25e6c', accent: '#d9a441', bg: '#fbf6f4', ink: '#2a1e20' },
  { id: 'emerald',     label: 'Emerald',     primary: '#1f7a5c', accent: '#d9a441', bg: '#f6faf7', ink: '#16241e' },
  { id: 'midnight',    label: 'Midnight',    primary: '#31456e', accent: '#c8a24a', bg: '#f7f8fa', ink: '#1a2233' },
  { id: 'terracotta',  label: 'Terracotta',  primary: '#b0562f', accent: '#e0b04c', bg: '#faf6f1', ink: '#2b1f18' },
  { id: 'lavender',    label: 'Lavender',    primary: '#6f5b9e', accent: '#d18ca4', bg: '#f9f7fc', ink: '#241f31' },
  { id: 'classic',     label: 'Classic',     primary: '#8a5a44', accent: '#d9a441', bg: '#faf7f3', ink: '#221c17' },
]

export const DEFAULT_PALETTE_ID = 'classic'

export function getPalette(id: string | undefined | null): PalettePreset {
  return PALETTES.find((p) => p.id === id) ?? PALETTES.find((p) => p.id === DEFAULT_PALETTE_ID)!
}

/**
 * Final CSS tokens for a (palette, mode) pair. Dark mode = fixed dark
 * neutrals + a lightened read of the palette primary so contrast holds.
 */
export function resolveTokens(palette: PalettePreset, mode: 'light' | 'dark'): PaletteTokens {
  if (mode === 'light') {
    return { primary: palette.primary, accent: palette.accent, bg: palette.bg, ink: palette.ink }
  }
  return {
    primary: lighten(palette.primary, 0.25),
    accent: palette.accent,
    bg: '#161311',
    ink: '#f2ede8',
  }
}

/** Tiny hex lightener (no deps): mixes the color toward white by `amount` 0..1. */
function lighten(hex: string, amount: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return hex
  const num = parseInt(m[1], 16)
  const mix = (c: number) => Math.round(c + (255 - c) * amount)
  const r = mix((num >> 16) & 0xff)
  const g = mix((num >> 8) & 0xff)
  const b = mix(num & 0xff)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
