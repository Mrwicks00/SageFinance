"use client"

import { Header } from "../components/layout/Header"
import { Footer } from "../components/layout/Footer"
import { HeroSection } from "../components/landing/HeroSection"
import { TrustIndicators } from "../components/landing/TrustIndicators"
import { FeatureGrid } from "../components/landing/FeatureGrid"
import { AIIntegrationSection } from "../components/landing/AIIntegrationSection" // Add here
import { StakingSection } from "../components/landing/StakingSection"
import { FAQSection } from "../components/landing/FAQSection"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <HeroSection />
      <TrustIndicators />
      <FeatureGrid />
      <AIIntegrationSection /> 
      <StakingSection />
      <FAQSection />
      <Footer />
    </main>
  )
}