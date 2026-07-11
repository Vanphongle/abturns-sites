// Built-in sample photography — shown wherever a shop hasn't uploaded its own
// imagery yet, replaced the moment they add real photos in the Website app.
// A salon site with empty sections never ships "nothing": the hero and
// gallery fall back to a curated set matched to the variation's mood.
//
// INTEGRITY RULE: imagery is aesthetic and may default; CLAIMS may not.
// Reviews / promotions / FAQs / team are never fabricated — those sections
// stay hidden until the shop adds real content. When the gallery is stock,
// the section header says "The experience" (not "Our work") so a default
// site never implies the photos are the shop's own portfolio.
//
// Source: pexels.com (free commercial license, no attribution required),
// curated + re-encoded to WebP 2026-07-11. File → Pexels photo id:
//   red-almond-closeup 17010955 · red-manicure-towel 3997386 ·
//   gold-tub-candles 6620703 · blush-tip-swatches 3997379 ·
//   mauve-nails-soft 939835 · pink-pedicure-care 17056221 ·
//   mono-salon-interior 13068361 · black-polish-plinth 15850907 ·
//   editorial-red-hand 17010952 · swatch-wheel-color 3997390 ·
//   lime-art-nails 5874876 · noir-glove-polish 3997389 ·
//   noir-uv-station 3997391 · noir-glove-detail 3997383 ·
//   uv-lamp-glow 3997392 · bath-tray-serene 6724402 ·
//   hammam-amber-glow 33852650 · noir-artist-brush 3997385 ·
//   swatch-fan-pick 3997377

export type StockMood = 'warm' | 'noir' | 'bright' | 'serene'

export interface StockPhoto {
  src: string
  alt: string
  w: number
  h: number
  /** Short chip label shown on gallery cards ("Soft almond"). */
  label?: string
}

export interface StockSet {
  /** Primary hero image. */
  hero: StockPhoto
  /** Flanking images for the Maison arch triptych. */
  sides: [StockPhoto, StockPhoto]
  gallery: StockPhoto[]
}

const P = (src: string, alt: string, w: number, h: number, label?: string): StockPhoto => ({ src: `/stock/${src}.webp`, alt, w, h, label })

const warmHero = P('red-almond-closeup', 'Classic red manicure, almond shape', 1120, 1400)
const noirHero = P('noir-glove-polish', 'Manicurist applying red polish', 933, 1400)
const brightHero = P('editorial-red-hand', 'Editorial red manicure', 1120, 1400)
const sereneHero = P('bath-tray-serene', 'Spa bath tray with candle and flowers', 1400, 933)

export const STOCK_SETS: Record<StockMood, StockSet> = {
  warm: {
    hero: warmHero,
    sides: [
      P('blush-tip-swatches', 'Choosing a soft pink shade', 933, 1400, 'Pick your shade'),
      P('gold-tub-candles', 'Spa bath with candles and gold details', 933, 1400),
    ],
    gallery: [
      P('red-manicure-towel', 'Fresh red manicure', 933, 1400, 'Classic red'),
      P('mauve-nails-soft', 'Soft mauve manicure', 1400, 933, 'Soft mauve'),
      P('blush-tip-swatches', 'Choosing a soft pink shade', 933, 1400, 'Pick your shade'),
      P('gold-tub-candles', 'Spa bath with candles', 933, 1400, 'Unwind'),
      P('pink-pedicure-care', 'Pedicure care in soft pink', 933, 1400, 'Gentle care'),
      P('swatch-fan-pick', 'Browsing nail shades', 933, 1400, 'Every color'),
    ],
  },
  noir: {
    hero: noirHero,
    sides: [
      P('mono-salon-interior', 'Modern salon interior', 915, 1400, 'The studio'),
      P('uv-lamp-glow', 'Gel manicure curing under UV light', 933, 1400),
    ],
    gallery: [
      P('mono-salon-interior', 'Modern salon interior', 915, 1400, 'The studio'),
      P('noir-uv-station', 'Manicure station at work', 933, 1400, 'At work'),
      P('noir-glove-detail', 'Precision detail work', 933, 1400, 'Detail work'),
      P('uv-lamp-glow', 'Gel curing under UV light', 933, 1400, 'Gel cure'),
      P('noir-artist-brush', 'Nail artist at work', 933, 1400, 'Hand-painted'),
      P('black-polish-plinth', 'Matte black polish', 787, 1400, 'Matte black'),
    ],
  },
  bright: {
    hero: brightHero,
    sides: [
      P('black-polish-plinth', 'Matte black polish on a plinth', 787, 1400),
      P('swatch-wheel-color', 'Color swatch wheel', 933, 1400),
    ],
    gallery: [
      P('black-polish-plinth', 'Matte black polish', 787, 1400, 'Matte black'),
      P('swatch-wheel-color', 'Choosing from the color wheel', 933, 1400, 'The wheel'),
      P('lime-art-nails', 'Playful nail art', 1400, 933, 'Nail art'),
      P('mono-salon-interior', 'Modern salon interior', 915, 1400, 'The studio'),
      P('red-manicure-towel', 'Fresh red manicure', 933, 1400, 'Classic red'),
      P('swatch-fan-pick', 'Browsing nail shades', 933, 1400, 'Every color'),
    ],
  },
  serene: {
    hero: sereneHero,
    sides: [
      P('pink-pedicure-care', 'Pedicure care in soft pink', 933, 1400, 'Gentle care'),
      P('hammam-amber-glow', 'Warm candle-lit spa room', 933, 1400, 'The ritual'),
    ],
    gallery: [
      P('hammam-amber-glow', 'Warm candle-lit spa room', 933, 1400, 'The ritual'),
      P('pink-pedicure-care', 'Pedicure care in soft pink', 933, 1400, 'Gentle care'),
      P('mauve-nails-soft', 'Soft mauve manicure', 1400, 933, 'Soft mauve'),
      P('gold-tub-candles', 'Spa bath with candles', 933, 1400, 'Unwind'),
      P('swatch-fan-pick', 'Browsing nail shades', 933, 1400, 'Every color'),
      P('blush-tip-swatches', 'Choosing a soft pink shade', 933, 1400, 'Pick your shade'),
    ],
  },
}

export function getStockSet(mood: StockMood): StockSet {
  return STOCK_SETS[mood] ?? STOCK_SETS.warm
}
