import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' })

// Per-site metadata comes from app/_sites/[slug]/page.tsx generateMetadata;
// this is only the fallback for the bare root.
export const metadata: Metadata = {
  title: 'Salon Websites',
  robots: { index: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
