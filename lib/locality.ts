// Best-effort city/state extraction from a US shop address string
// ("3845 Hampton Hills Dr, Lakeland, FL33810" → { city: 'Lakeland', state: 'FL' }).
// Used for locality-aware SEO defaults (title, meta, schema PostalAddress).
// Heuristic by design — returns nulls rather than guessing when unsure.

export interface Locality {
  city: string | null
  state: string | null
  street: string | null
  zip: string | null
}

export function parseLocality(address: string | null | undefined): Locality {
  const out: Locality = { city: null, state: null, street: null, zip: null }
  if (!address) return out
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length === 0) return out
  out.street = parts[0] || null

  // State + zip usually live in the LAST segment ("FL33810", "FL 33810", "FL").
  const last = parts[parts.length - 1] || ''
  const m = /\b([A-Za-z]{2})\s*(\d{5})?(?:-\d{4})?\s*$/.exec(last)
  if (m) {
    out.state = m[1].toUpperCase()
    out.zip = m[2] ?? null
  }

  if (parts.length >= 3) {
    out.city = parts[parts.length - 2] || null
  } else if (parts.length === 2) {
    // "street, City ST zip" — strip the state/zip tail from the city segment.
    const cityish = last.replace(/\b[A-Za-z]{2}\s*\d{5}(?:-\d{4})?\s*$/, '').replace(/\b[A-Za-z]{2}\s*$/, '').trim()
    out.city = cityish || null
  }
  return out
}
