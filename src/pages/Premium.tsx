import { useState } from "react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  popular?: boolean;
  features: PlanFeature[];
  gradient: string;
  buttonText: string;
}

export default function Premium() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const pricingPlans: PricingPlan[] = [
    {
      id: "basic",
      name: "Basic",
      description: "Perfect for getting started",
      price: billingPeriod === "yearly" ? "$4" : "$5",
      period:
        billingPeriod === "yearly" ? "per month, billed yearly" : "per month",
      gradient: "from-slate-600 to-slate-700",
      buttonText: "Get Started",
      features: [
        { text: "Ad-free experience", included: true },
        { text: "Premium badges", included: true },
        { text: "Custom themes", included: false },
        { text: "Enhanced privacy", included: false },
        { text: "Priority support", included: false },
        { text: "Advanced analytics", included: false },
        { text: "Custom emojis", included: false },
        { text: "Increased file uploads", included: false },
        { text: "Early access to features", included: false },
        { text: "Exclusive communities", included: false },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      description: "Most popular choice",
      price: billingPeriod === "yearly" ? "$8" : "$10",
      period:
        billingPeriod === "yearly" ? "per month, billed yearly" : "per month",
      popular: true,
      gradient: "from-purple-600 to-pink-600",
      buttonText: "Go Pro",
      features: [
        { text: "Ad-free experience", included: true },
        { text: "Premium badges", included: true },
        { text: "Custom themes", included: true },
        { text: "Enhanced privacy", included: true },
        { text: "Priority support", included: true },
        { text: "Advanced analytics", included: false },
        { text: "Custom emojis", included: false },
        { text: "Increased file uploads", included: false },
        { text: "Early access to features", included: false },
        { text: "Exclusive communities", included: false },
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For power users and creators",
      price: billingPeriod === "yearly" ? "$15" : "$20",
      period:
        billingPeriod === "yearly" ? "per month, billed yearly" : "per month",
      gradient: "from-cyan-500 to-blue-600",
      buttonText: "Get Enterprise",
      features: [
        { text: "Ad-free experience", included: true },
        { text: "Premium badges", included: true },
        { text: "Custom themes", included: true },
        { text: "Enhanced privacy", included: true },
        { text: "Priority support", included: true },
        { text: "Advanced analytics", included: true },
        { text: "Custom emojis", included: true },
        { text: "Increased file uploads", included: true },
        { text: "Early access to features", included: true },
        { text: "Exclusive communities", included: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-900/50 to-pink-900/50 border-b border-slate-700/50">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-purple-600/20 border border-purple-500/30 px-4 py-2 rounded-full mb-6">
            <span className="text-purple-300 text-sm">✨</span>
            <span className="text-purple-300 text-sm font-medium">
              Premium Features
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Upgrade Your
            <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}
              Experience
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Unlock powerful features, support our platform, and take your social
            experience to the next level.
          </p>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-12">
          <div className="bg-slate-800/50 rounded-2xl p-2 border border-slate-700/50">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  billingPeriod === "monthly"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  billingPeriod === "yearly"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-500 text-slate-900 px-2 py-1 rounded-full">
                  Save 25%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-slate-800/50 rounded-3xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.popular
                  ? "border-purple-500/50 shadow-2xl shadow-purple-500/20"
                  : "border-slate-700/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-400">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center space-x-2">
                    <span className="text-5xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-slate-400">/month</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">{plan.period}</p>
                  {billingPeriod === "yearly" && plan.id === "pro" && (
                    <p className="text-green-400 text-sm mt-1">
                      Save $24 annually
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          feature.included
                            ? "bg-green-500 text-white"
                            : "bg-slate-700 text-slate-500"
                        }`}
                      >
                        {feature.included ? "✓" : "✗"}
                      </div>
                      <span
                        className={`text-sm ${
                          feature.included ? "text-white" : "text-slate-500"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-200 bg-linear-to-r ${plan.gradient} hover:shadow-lg hover:scale-105`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Showcase */}
        <div className="bg-slate-800/30 rounded-3xl border border-slate-700/50 p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Premium{" "}
              <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Benefits
              </span>
            </h2>
            <p className="text-slate-400 text-lg">
              Discover everything you get with SocialHub Premium
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🚫",
                title: "Ad-Free Experience",
                description:
                  "Enjoy SocialHub without any advertisements interrupting your flow.",
              },
              {
                icon: "🎨",
                title: "Custom Themes",
                description:
                  "Personalize your interface with custom color schemes and dark modes.",
              },
              {
                icon: "🛡️",
                title: "Enhanced Privacy",
                description:
                  "Take control of your privacy with advanced settings and controls.",
              },
              {
                icon: "📊",
                title: "Advanced Analytics",
                description:
                  "Get detailed insights into your content performance and audience.",
              },
              {
                icon: "⚡",
                title: "Priority Support",
                description:
                  "Skip the line with dedicated premium customer support.",
              },
              {
                icon: "👑",
                title: "Exclusive Badges",
                description:
                  "Stand out with special badges that show your premium status.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-200 group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: "Can I cancel my subscription anytime?",
                answer:
                  "Yes, you can cancel your premium subscription at any time. Your benefits will remain active until the end of your billing period.",
              },
              {
                question: "Is there a free trial?",
                answer:
                  "We offer a 7-day free trial for all premium plans. No credit card required to start the trial.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards, PayPal, and various regional payment methods.",
              },
              {
                question: "Can I switch between plans?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50"
              >
                <h3 className="text-white font-semibold mb-3">
                  {faq.question}
                </h3>
                <p className="text-slate-400 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
