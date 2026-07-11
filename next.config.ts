import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Verification builds write elsewhere so `npm run build:check` can never
  // corrupt a running dev server's .next (bit us three times, 2026-07-11).
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Marketing sites render <img> directly (Supabase Storage public URLs +
  // occasional sample photos) — no next/image optimizer config needed.
  poweredByHeader: false,
}

export default nextConfig
