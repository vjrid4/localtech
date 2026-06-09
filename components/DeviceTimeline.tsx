export default function DeviceTimeline() {
  const stages = [
    {
      title: "Device Registration",
      description: "Every device gets a unique digital identity and health baseline.",
      icon: "📱",
    },
    {
      title: "Repair History",
      description: "Complete chronological record of all repairs, parts, and costs.",
      icon: "🔧",
    },
    {
      title: "Health Passport",
      description: "Real-time device health metrics, battery status, and diagnostics.",
      icon: "💚",
    },
    {
      title: "Warranty Coverage",
      description: "Digital warranty tracking with instant claim verification.",
      icon: "🛡️",
    },
    {
      title: "Resale Verification",
      description: "Transparent device history for secure second-hand markets.",
      icon: "💱",
    },
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            The Device Journey
          </h2>
          <p className="text-xl text-graphite-400 max-w-2xl mx-auto">
            From purchase to resale, DeviceDNA tracks every moment in a device's life
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2">
          {stages.map((stage, index) => (
            <div key={index} className="relative">
              <div className="glass rounded-xl p-6 h-full flex flex-col justify-center hover:bg-opacity-10 transition-all duration-300 cursor-pointer hover:border-accent-500">
                <div className="text-4xl mb-4">{stage.icon}</div>
                <h3 className="font-bold text-lg mb-2">{stage.title}</h3>
                <p className="text-sm text-graphite-400">{stage.description}</p>
              </div>

              {/* Connector line */}
              {index < stages.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-1 w-2 h-0.5 bg-gradient-to-r from-accent-500 to-transparent transform -translate-y-1/2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
