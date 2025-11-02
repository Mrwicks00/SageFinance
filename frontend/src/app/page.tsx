"use client"

import { Header } from "../components/layout/Header"
import { Footer } from "../components/layout/Footer"
import { EnhancedHeroSection } from "../components/landing/EnhancedHeroSection"
import { TrustIndicators } from "../components/landing/TrustIndicators"
import { HowItWorksSection } from "../components/landing/HowItWorksSection"
import { FeatureGrid } from "../components/landing/FeatureGrid"
import { MetricsSection } from "../components/landing/MetricsSection"
import { AIIntegrationSection } from "../components/landing/AIIntegrationSection"
import { StakingSection } from "../components/landing/StakingSection"
import { TestimonialsSection } from "../components/landing/TestimonialsSection"
import { FAQSection } from "../components/landing/FAQSection"
import { FinalCTASection } from "../components/landing/FinalCTASection"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <EnhancedHeroSection />
      <TrustIndicators />
      <HowItWorksSection />
      <MetricsSection />
      <FeatureGrid />
      <AIIntegrationSection />
      <StakingSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </main>
  )
}