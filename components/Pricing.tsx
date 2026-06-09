export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "₹5,999",
      period: "/month",
      description: "Perfect for single technicians",
      features: ["Up to 50 repairs/month", "Basic inventory", "Mobile app access", "Email support"],
      cta: "Start Free Trial",
      highlight: false,
    },
    {
      name: "Professional",
      price: "₹19,999",
      period: "/month",
      description: "For growing repair shops",
      features: ["Unlimited repairs", "Multi-branch support", "WhatsApp integration", "AI diagnostics", "Priority support"],
      cta: "Start Free Trial",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large networks",
      features: ["Everything in Pro", "Custom integrations", "Dedicated support", "API access", "Training program"],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Simple, Transparent Pricing</h2>
          <p className="text-xl text-graphite-400 max-w-2xl mx-auto">
            No hidden fees. Scale your business without scaling your costs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 transition-all duration-300 ${
                plan.highlight
                  ? "glass-lg border-accent-500 shadow-glow"
                  : "glass hover:border-accent-500"
              }`}
            >
              {plan.highlight && (
                <div className="inline-block px-3 py-1 bg-accent-500 text-graphite-950 text-xs font-bold rounded-full mb-4">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-graphite-400 text-sm mb-6">{plan.description}</p>

              <div className="mb-8">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-graphite-400 ml-2">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="text-sm flex items-start gap-3">
                    <span className="text-accent-500 font-bold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 font-bold rounded-lg transition-all duration-300 ${
                  plan.highlight
                    ? "bg-accent-500 text-graphite-950 hover:bg-accent-400"
                    : "glass border border-accent-500 text-white hover:bg-opacity-20"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
