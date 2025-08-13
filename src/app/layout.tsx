import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { GlobalNavigation } from '@/components/GlobalNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NOHVEX - Professional Crypto Exchange Platform',
  description: 'Trade 900+ cryptocurrencies with zero fees. Secure, fast, and anonymous crypto trading platform with real-time prices and instant execution.',
  authors: [{ name: 'NOHVEX Team' }],
  keywords: ['cryptocurrency', 'crypto exchange', 'bitcoin', 'ethereum', 'trading', 'blockchain', 'digital assets'],
  openGraph: {
    title: 'NOHVEX - Professional Crypto Exchange',
    description: 'Trade 900+ cryptocurrencies with zero fees. Secure, fast, and anonymous crypto trading.',
    siteName: 'NOHVEX',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NOHVEX - Professional Crypto Exchange',
    description: 'Trade 900+ cryptocurrencies with zero fees. Secure, fast, and anonymous crypto trading.',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
