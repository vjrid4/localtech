export default function KnowledgeUniverse() {
  const knowledge = [
    { title: "Schematics Library", items: "10K+", icon: "🔌" },
    { title: "Hardware Solutions", items: "50K+", icon: "⚙️" },
    { title: "Community Tips", items: "100K+", icon: "💡" },
    { title: "Training Academy", items: "500+", icon: "🎓" },
  ];

  return (
    <section className="py-24 px-6 bg-graphite-900 bg-opacity-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Knowledge Universe</h2>
          <p className="text-xl text-graphite-400 max-w-2xl mx-auto">
            Crowdsourced and AI-curated knowledge base for every device, component, and repair scenario
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {knowledge.map((item, index) => (
            <div
              key={index}
              className="glass rounded-xl p-6 text-center hover:border-accent-500 transition-all duration-300 cursor-pointer hover:shadow-glow"
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <div className="text-3xl font-bold text-accent-500 mb-2">{item.items}</div>
              <p className="text-sm font-medium">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
