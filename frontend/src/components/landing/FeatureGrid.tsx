import { Card, CardContent } from "../../components/ui/Card"
import { FEATURES } from "../../data/features"
import { useScrollAnimation, useStaggeredAnimation } from "../../hooks/use-scroll-animation"
import {
  Sparkles,
  Shield,
  Zap,
  Brain,
  TrendingUp,
  Globe,
  Lock,
  Rocket,
  Target,
  Layers,
  BarChart3,
  Coins,
} from "lucide-react"

// Enhanced icon mapping - you can customize these based on your actual features
const iconMap: { [key: string]: any } = {
  ai: Brain,
  security: Shield,
  speed: Zap,
  analytics: BarChart3,
  yield: TrendingUp,
  multichain: Globe,
  defi: Coins,
  smart: Sparkles,
  protection: Lock,
  performance: Rocket,
  precision: Target,
  integration: Layers,
  // Add more mappings as needed
}

export function FeatureGrid() {
  const headerAnimation = useScrollAnimation({ animation: "slide-up", duration: 800 })
  const featureAnimations = useStaggeredAnimation(FEATURES.length, {
    animation: "slide-up",
    stagger: 150,
    duration: 600,
  })

  // Function to get icon component based on feature
  const getIconComponent = (feature: any, index: number) => {
    // Try to match by feature title/id, fallback to default icons
    const titleLower = feature.title?.toLowerCase() || ""

    if (titleLower.includes("ai") || titleLower.includes("smart")) return Brain
    if (titleLower.includes("security") || titleLower.includes("safe")) return Shield
    if (titleLower.includes("speed") || titleLower.includes("fast")) return Zap
    if (titleLower.includes("yield") || titleLower.includes("earn")) return TrendingUp
    if (titleLower.includes("chain") || titleLower.includes("multi")) return Globe
    if (titleLower.includes("analytics") || titleLower.includes("data")) return BarChart3
    if (titleLower.includes("defi") || titleLower.includes("finance")) return Coins
    if (titleLower.includes("protect")) return Lock
    if (titleLower.includes("performance")) return Rocket
    if (titleLower.includes("target") || titleLower.includes("precision")) return Target
    if (titleLower.includes("integration")) return Layers

    // Fallback icons based on index
    const fallbackIcons = [Sparkles, Shield, Zap, Brain, TrendingUp, Globe, Lock, Rocket, Target]
    return fallbackIcons[index % fallbackIcons.length]
  }

  return (
    <section id="features" className="py-20 bg-black relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/50 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,223,0,0.03),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.02),transparent_70%)]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerAnimation.ref} className={`text-center mb-16 ${headerAnimation.className}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Powerful Features for Modern DeFi
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of decentralized finance with our AI-powered platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => {
            const IconComponent = getIconComponent(feature, index)

            return (
              <div key={feature.id} ref={featureAnimations[index].ref} className={featureAnimations[index].className}>
                <Card className="group relative overflow-hidden bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/[0.15] hover:border-yellow-400/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-500/20">
                  {/* Glass overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/[0.03] via-transparent to-purple-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Animated border glow */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/20 via-purple-400/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

                  <CardContent className="relative z-10 p-8 text-center">
                    {/* Enhanced Icon Container */}
                    <div className="relative mb-6">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400/20 via-yellow-400/10 to-purple-500/20 rounded-2xl flex items-center justify-center border border-yellow-400/30 group-hover:border-yellow-400/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        {/* Icon glow effect */}
                        <div className="absolute inset-0 bg-yellow-400/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <IconComponent className="w-8 h-8 text-yellow-400 group-hover:text-yellow-300 transition-all duration-300 relative z-10" />
                      </div>

                      {/* Floating particles */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                      <div
                        className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-400/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-yellow-300 transition-colors duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-gray-300 mb-4 group-hover:text-gray-200 transition-colors duration-300">
                      {feature.description}
                    </p>

                    <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      {feature.details}
                    </p>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
