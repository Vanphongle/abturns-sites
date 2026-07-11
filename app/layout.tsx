import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond, Archivo, Jost } from 'next/font/google'
import './globals.css'

// Font system for the luxury lineup — one body face, three display faces
// keyed by the catalog's `fonts` axis: serif → Cormorant (Maison),
// editorial → Archivo (Atelier), geo → Jost (Riviera).
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
})
const archivo = Archivo({ subsets: ['latin'], variable: '--font-editorial' })
const jost = Jost({ subsets: ['latin'], variable: '--font-geo' })

// Per-site metadata comes from app/sites/[slug]/page.tsx generateMetadata;
// this is only the fallback for the bare root.
export const metadata: Metadata = {
  title: 'Salon Websites',
  robots: { index: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${archivo.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  )
}
