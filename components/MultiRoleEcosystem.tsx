export default function MultiRoleEcosystem() {
  const roles = [
    {
      title: "Repair Shop Owners",
      features: ["ERP Management", "Multi-Branch Control", "GST Billing", "Analytics Dashboard"],
      icon: "🏢",
    },
    {
      title: "Technicians",
      features: ["Mobile App", "Job Queue", "Knowledge Access", "Performance Tracking"],
      icon: "👨‍🔧",
    },
    {
      title: "Customers",
      features: ["Device Health", "Repair History", "Warranty Tracking", "Community Marketplace"],
      icon: "👤",
    },
    {
      title: "Suppliers",
      features: ["Marketplace Platform", "Order Management", "Analytics", "Certification Program"],
      icon: "📦",
    },
  ];

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Multi-Role Ecosystem</h2>
          <p className="text-xl text-graphite-400 max-w-2xl mx-auto">
            Designed for the entire mobile repair industry, from shop owners to technicians to customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-8 hover:border-accent-500 transition-all duration-300 group cursor-pointer"
            >
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {role.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{role.title}</h3>
              <ul className="space-y-2">
                {role.features.map((feature, i) => (
                  <li key={i} className="text-sm text-graphite-300 flex items-start gap-2">
                    <span className="text-accent-500 font-bold">→</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
