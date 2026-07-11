import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Marketing sites render <img> directly (Supabase Storage public URLs +
  // occasional sample photos) — no next/image optimizer config needed.
  poweredByHeader: false,
}

export default nextConfig
