import { Card, CardContent, CardHeader } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { STAKING_FEATURES, WEEKLY_REWARDS } from "../../data/staking"
import { Coins, Gift, Zap } from "lucide-react"
import { useScrollAnimation, useStaggeredAnimation } from "../../hooks/use-scroll-animation"

export function StakingSection() {
  const headerAnimation = useScrollAnimation({ animation: "slide-up", duration: 800 })
  const stakingAnimations = useStaggeredAnimation(STAKING_FEATURES.length, {
    animation: "slide-up",
    stagger: 200,
    duration: 600,
  })
  const rewardsAnimation = useScrollAnimation({ animation: "scale-up", duration: 800, delay: 400 })
  const ctaAnimation = useScrollAnimation({ animation: "fade-in", duration: 600, delay: 600 })

  return (
    <section id="staking" className="py-20 bg-gradient-to-br from-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerAnimation.ref} className={`text-center mb-16 ${headerAnimation.className}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Stake{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">SAGE</span> &
            Earn Rewards
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Maximize your returns with multi-chain staking and weekly random rewards powered by Chainlink VRF
          </p>
        </div>

        {/* Staking Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {STAKING_FEATURES.map((feature, index) => (
            <div key={feature.id} ref={stakingAnimations[index].ref} className={stakingAnimations[index].className}>
              <Card
                glassmorphism
                className="group hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20 border-gray-800/50 hover:border-yellow-500/30"
              >
                <CardHeader>
                  <div className="text-4xl mb-4 text-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white text-center group-hover:text-yellow-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-300 mb-4">{feature.description}</p>
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 transform group-hover:scale-105 transition-transform duration-300">
                    <span className="text-yellow-400 font-bold text-lg">APY: {feature.apy}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Weekly Rewards Section */}
        <div
          ref={rewardsAnimation.ref}
          className={`bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-2xl p-8 mb-12 transform hover:scale-[1.02] transition-all duration-500 ${rewardsAnimation.className}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Gift className="w-8 h-8 text-yellow-400" />
                <h3 className="text-2xl font-bold text-white">Weekly SAGE Rewards</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Use our yield platform and get a chance to win weekly SAGE token rewards! Every week, Chainlink VRF
                randomly selects lucky winners from our active users.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">{WEEKLY_REWARDS.totalWinners}</div>
                  <div className="text-gray-400 text-sm">Winners Weekly</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">{WEEKLY_REWARDS.rewardAmount}</div>
                  <div className="text-gray-400 text-sm">Per Winner</div>
                </div>
              </div>
            </div>
            <div className="bg-black/30 rounded-xl p-6 border border-gray-700 transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
                <span className="text-white font-medium">Powered by Chainlink VRF</span>
              </div>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Provably random selection</li>
                <li>• Transparent on-chain verification</li>
                <li>• Fair distribution every week</li>
                <li>• Automatic reward distribution</li>
              </ul>
              <Button className="w-full mt-4 transform hover:scale-105 transition-transform duration-300" size="sm">
                <Coins className="w-4 h-4 mr-2" />
                Start Earning Rewards
              </Button>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div ref={ctaAnimation.ref} className={`text-center ${ctaAnimation.className}`}>
          <Button size="lg" className="mr-4 transform hover:scale-105 transition-transform duration-300">
            Start Staking SAGE
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="transform hover:scale-105 transition-transform duration-300 bg-transparent"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}
