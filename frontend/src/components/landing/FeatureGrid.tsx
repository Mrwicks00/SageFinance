import { Card, CardContent } from "../../components/ui/Card"
import { FEATURES } from "../../data/features"

export function FeatureGrid() {
  return (
    <section id="features" className="py-20 bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Powerful Features for Modern DeFi
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of decentralized finance with our AI-powered platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <Card key={feature.id} glassmorphism className="group hover:scale-105 transition-transform duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 mb-4">{feature.description}</p>
                <p className="text-sm text-gray-400">{feature.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
