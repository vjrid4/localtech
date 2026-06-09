export default function CTA() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Glow effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-accent-500 rounded-full mix-blend-screen filter blur-3xl opacity-15"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          The Future of Mobile Repair <br />
          <span className="gradient-text">Starts Today</span>
        </h2>

        <p className="text-xl text-graphite-300 mb-12 max-w-2xl mx-auto">
          Join repair shops, technicians, and suppliers building the next generation of
          device management. No credit card required.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-6 py-4 rounded-lg bg-graphite-800 border border-graphite-600 focus:border-accent-500 focus:outline-none flex-1 max-w-xs"
          />
          <button className="px-8 py-4 bg-accent-500 text-graphite-950 font-bold rounded-lg hover:bg-accent-400 transition-all duration-300 whitespace-nowrap">
            Get Started Free
          </button>
        </div>

        <p className="text-sm text-graphite-500">
          14-day free trial. No credit card required. Full access to all features.
        </p>
      </div>
    </section>
  );
}
