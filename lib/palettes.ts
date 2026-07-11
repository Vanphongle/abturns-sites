// Palette presets — Website Builder v1 (fixed presets only; custom = v2).
// Four tokens drive every theme: primary (CTAs/links), accent (gold details,
// stars, hairlines), bg (page), ink (text). Values tuned for the luxury
// lineup: deep, low-saturation primaries + a champagne-gold accent family so
// every combination reads expensive. Dark variations keep the palette's
// primary/accent but swap bg/ink for warm near-black neutrals — resolveTokens.

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
  { id: 'rose-quartz', label: 'Rose Quartz', primary: '#a1465a', accent: '#c39a4e', bg: '#faf5f2', ink: '#241a1b' },
  { id: 'emerald',     label: 'Emerald',     primary: '#14584a', accent: '#c39a4e', bg: '#f5f8f5', ink: '#101f1a' },
  { id: 'midnight',    label: 'Midnight',    primary: '#232f52', accent: '#b3873e', bg: '#f6f7f9', ink: '#141a29' },
  { id: 'terracotta',  label: 'Terracotta',  primary: '#9c4a24', accent: '#cf9a43', bg: '#faf4ee', ink: '#251710' },
  { id: 'lavender',    label: 'Lavender',    primary: '#59477e', accent: '#c68f9d', bg: '#f8f6fb', ink: '#1d1729' },
  { id: 'classic',     label: 'Classic',     primary: '#6e4632', accent: '#c39a4e', bg: '#f9f5f0', ink: '#1f1712' },
]

export const DEFAULT_PALETTE_ID = 'classic'

export function getPalette(id: string | undefined | null): PalettePreset {
  return PALETTES.find((p) => p.id === id) ?? PALETTES.find((p) => p.id === DEFAULT_PALETTE_ID)!
}

/**
 * Final CSS tokens for a (palette, mode) pair. Dark mode = warm near-black
 * neutrals (candlelit, not tech-black) + a lightened read of the palette
 * primary so contrast holds against the deep background.
 */
export function resolveTokens(palette: PalettePreset, mode: 'light' | 'dark'): PaletteTokens {
  if (mode === 'light') {
    return { primary: palette.primary, accent: palette.accent, bg: palette.bg, ink: palette.ink }
  }
  return {
    primary: lighten(palette.primary, 0.42),
    accent: lighten(palette.accent, 0.12),
    bg: '#131010',
    ink: '#f3ede6',
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
