export default function Hero() {
  return (
    <section className="min-h-screen relative overflow-hidden flex items-center justify-center pt-20">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="mb-6 fade-in">
          <span className="inline-block px-4 py-2 glass rounded-full text-sm font-medium text-accent-300 mb-8">
            ✨ The Future of Mobile Repair Intelligence
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 fade-in-up leading-tight">
          <span className="gradient-text">Every Device</span>
          <br />
          <span className="text-white">Deserves a Digital Life</span>
        </h1>

        <p className="text-xl md:text-2xl text-graphite-300 mb-12 max-w-3xl mx-auto fade-in-up" style={{ animationDelay: "0.2s" }}>
          DeviceDNA transforms mobile repair from a service into an intelligent ecosystem.
          Every device gets a digital identity, repair history, health passport, and predictive intelligence.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 fade-in-up" style={{ animationDelay: "0.4s" }}>
          <button className="px-8 py-4 bg-accent-500 text-graphite-950 font-bold rounded-lg hover:bg-accent-400 transition-all duration-300 hover:shadow-glow text-lg">
            Start Free Trial
          </button>
          <button className="px-8 py-4 glass font-bold rounded-lg text-white hover:bg-opacity-10 transition-all duration-300 text-lg border border-accent-500 hover:border-accent-400">
            Watch Demo
          </button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto fade-in-up" style={{ animationDelay: "0.6s" }}>
          <div className="glass rounded-lg p-4">
            <div className="text-2xl font-bold text-accent-500 mb-2">20+</div>
            <div className="text-sm text-graphite-400">Core Modules</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="text-2xl font-bold text-accent-500 mb-2">AI</div>
            <div className="text-sm text-graphite-400">Powered Diagnosis</div>
          </div>
          <div className="glass rounded-lg p-4">
            <div className="text-2xl font-bold text-accent-500 mb-2">∞</div>
            <div className="text-sm text-graphite-400">Scalability</div>
          </div>
        </div>

        {/* Hero device mockup placeholder */}
        <div className="mt-20 relative fade-in-up" style={{ animationDelay: "0.8s" }}>
          <div className="glass rounded-3xl p-2 w-full max-w-4xl mx-auto">
            <div className="bg-gradient-to-b from-graphite-800 to-graphite-900 rounded-2xl aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-graphite-400">Dashboard Preview Coming</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
