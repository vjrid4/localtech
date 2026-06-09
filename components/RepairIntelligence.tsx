export default function RepairIntelligence() {
  const features = [
    { title: "Predictive Failure Analysis", desc: "AI anticipates device failures before they happen" },
    { title: "Smart Diagnostics", desc: "Instant root cause analysis from symptom descriptions" },
    { title: "Parts Forecasting", desc: "ML-powered inventory predictions reduce waste" },
    { title: "Repair Optimization", desc: "Dynamic scheduling and technician matching" },
  ];

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div>
            <span className="text-accent-500 font-mono text-sm font-bold">CORE ENGINE</span>
            <h2 className="text-5xl md:text-6xl font-bold mt-4 mb-8">
              Repair Intelligence Engine
            </h2>
            <p className="text-lg text-graphite-300 mb-8">
              Our proprietary AI analyzes millions of repair data points to deliver instant,
              accurate diagnostics and predictive maintenance recommendations.
            </p>

            <div className="space-y-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center text-graphite-950 font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{feature.title}</h3>
                    <p className="text-graphite-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="px-6 py-3 bg-accent-500 text-graphite-950 font-bold rounded-lg hover:bg-accent-400 transition-all duration-300">
              Explore Intelligence Features
            </button>
          </div>

          {/* Right side - Visual */}
          <div className="glass rounded-2xl p-8 h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🧠</div>
              <p className="text-graphite-400">AI Diagnostic Engine Visualization</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
