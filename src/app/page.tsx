'use client'

import { CryptoTicker } from '@/components/CryptoTicker'
import { HeroSection } from '@/components/HeroSection'
import { TrustSignals } from '@/components/TrustSignals'
import { TradingWidget } from '@/components/TradingWidget'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Live Crypto Ticker */}
      <section className="py-8">
        <CryptoTicker />
      </section>
      
      {/* Trust Signals */}
      <section className="py-16">
        <TrustSignals />
      </section>
      
      {/* Trading Widget */}
      <section className="py-16">
        <TradingWidget />
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
