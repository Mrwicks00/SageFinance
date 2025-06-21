"use client"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

// Sample FAQ data for demonstration
const FAQ_DATA = [
  {
    id: "1",
    question: "What is SageFi and how does it work?",
    answer: "SageFi is a comprehensive financial platform that combines AI-powered insights with traditional investment tools. Our platform analyzes market trends, provides personalized recommendations, and helps you make informed financial decisions through advanced algorithms and real-time data processing."
  },
  {
    id: "2", 
    question: "How secure is my financial data on SageFi?",
    answer: "We employ bank-level security measures including 256-bit SSL encryption, two-factor authentication, and regular security audits. Your data is stored in secure, compliant data centers and we never share your personal information with third parties without your explicit consent."
  },
  {
    id: "3",
    question: "What fees does SageFi charge?",
    answer: "SageFi offers transparent pricing with no hidden fees. Our basic plan is free for up to $10,000 in assets, with premium plans starting at $9.99/month. We charge a small management fee of 0.25% annually for managed portfolios, which is significantly lower than traditional financial advisors."
  },
  {
    id: "4",
    question: "Can I withdraw my funds at any time?",
    answer: "Yes, you have complete control over your funds. You can withdraw your money at any time without penalties. Most withdrawals are processed within 1-3 business days, depending on your bank and the type of account you're withdrawing from."
  },
  {
    id: "5",
    question: "Do you offer customer support?",
    answer: "Absolutely! We provide 24/7 customer support through multiple channels including live chat, email, and phone. Our team of financial experts and technical specialists are always ready to help you with any questions or concerns you may have."
  }
]

export  function FAQSection() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems((prev) => 
      prev.includes(id) 
        ? prev.filter((item) => item !== id) 
        : [...prev, id]
    )
  }

  return (
    <section id="faq" className="py-20 bg-black min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Reduced max width for better readability */}
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to know about SageFi and our platform
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3">
            {FAQ_DATA.map((item) => {
              const isOpen = openItems.includes(item.id)

              return (
                <div
                  key={item.id}
                  className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-gray-700 hover:bg-gray-900/70"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:ring-inset group transition-all duration-200"
                  >
                    <span className="text-white font-semibold text-lg pr-4 group-hover:text-yellow-50 transition-colors duration-200">
                      {item.question}
                    </span>
                    <div className="flex-shrink-0 transition-transform duration-300 ease-in-out">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-yellow-400 transform rotate-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors duration-200" />
                      )}
                    </div>
                  </button>

                  {/* Animated content area */}
                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen 
                        ? 'max-h-96 opacity-100' 
                        : 'max-h-0 opacity-0'
                    }`}
                    style={{
                      overflow: 'hidden'
                    }}
                  >
                    <div className="px-6 pb-6">
                      <div className="border-t border-gray-800/50 pt-4">
                        <p className="text-gray-300 leading-relaxed text-base">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-16">
            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8">
              <p className="text-gray-400 mb-6 text-lg">Still have questions?</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="mailto:support@sagefi.com"
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25"
                >
                  Contact Support
                </a>
                <span className="text-gray-600 hidden sm:block">•</span>
                <a 
                  href="/docs" 
                  className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 font-medium border border-yellow-400/30 hover:border-yellow-400/50 px-6 py-3 rounded-xl hover:bg-yellow-400/5"
                >
                  Read Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}