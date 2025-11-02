"use client"

import { Star, Quote } from "lucide-react"
import { useScrollAnimation, useStaggeredAnimation } from "../../hooks/use-scroll-animation"

const TESTIMONIALS = [
  {
    id: 1,
    name: "Alex Chen",
    role: "DeFi Trader",
    avatar: "https://i.pravatar.cc/150?img=12",
    content: "SageFi's AI agent is a game-changer. I went from spending hours researching yields to executing strategies in minutes. The cross-chain capabilities are seamless.",
    rating: 5,
    highlight: "Saved 10+ hours/week"
  },
  {
    id: 2,
    name: "Sarah Martinez",
    role: "Crypto Investor",
    avatar: "https://i.pravatar.cc/150?img=45",
    content: "As someone new to DeFi, SageFi made everything accessible. The AI explains everything clearly and I'm earning yields I never thought possible.",
    rating: 5,
    highlight: "12.3% APY achieved"
  },
  {
    id: 3,
    name: "Michael Park",
    role: "Portfolio Manager",
    avatar: "https://i.pravatar.cc/150?img=33",
    content: "The automation and optimization features are incredible. SageFi constantly finds better opportunities and rebalances my portfolio automatically.",
    rating: 5,
    highlight: "+18% returns"
  }
]

export function TestimonialsSection() {
  const headerAnimation = useScrollAnimation({ animation: "slide-up", duration: 800 })
  const testimonialAnimations = useStaggeredAnimation(TESTIMONIALS.length, {
    animation: "slide-up",
    stagger: 200,
    duration: 600,
  })

  return (
    <section className="py-24 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(147,51,234,0.08),transparent_50%)]"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div ref={headerAnimation.ref} className={`text-center mb-16 ${headerAnimation.className}`}>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-medium mb-6">
            <Star className="w-4 h-4 mr-2 fill-current" />
            Loved by Users
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            What Our <span className="bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">Users Say</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join thousands of satisfied users earning more with less effort
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={testimonial.id}
              ref={testimonialAnimations[index].ref}
              className={`group ${testimonialAnimations[index].className}`}
            >
              <div className="relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 h-full flex flex-col">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-yellow-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 flex flex-col h-full">
                  {/* Quote Icon */}
                  <div className="mb-6">
                    <Quote className="w-10 h-10 text-yellow-400/30 group-hover:text-yellow-400/50 transition-colors" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-gray-300 leading-relaxed mb-6 flex-grow group-hover:text-white transition-colors">
                    "{testimonial.content}"
                  </p>

                  {/* Highlight */}
                  <div className="mb-6">
                    <div className="inline-flex items-center px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                      <span className="text-yellow-400 text-sm font-semibold">{testimonial.highlight}</span>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center space-x-4 pt-6 border-t border-gray-800/50">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full border-2 border-yellow-500/30 group-hover:border-yellow-500/50 transition-colors"
                    />
                    <div>
                      <div className="text-white font-semibold group-hover:text-yellow-300 transition-colors">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-400 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}