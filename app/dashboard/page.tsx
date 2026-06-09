export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-graphite-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-graphite-400 mb-12">
          Welcome to DeviceDNA. Select your role to continue.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Repair Shop Owner Dashboard */}
          <a
            href="/dashboard/shop"
            className="glass rounded-2xl p-8 hover:border-accent-500 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏢</div>
            <h2 className="text-2xl font-bold mb-2">Repair Shop</h2>
            <p className="text-graphite-400 text-sm">
              Manage repairs, branches, technicians, and billing
            </p>
          </a>

          {/* Technician Dashboard */}
          <a
            href="/dashboard/technician"
            className="glass rounded-2xl p-8 hover:border-accent-500 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">👨‍🔧</div>
            <h2 className="text-2xl font-bold mb-2">Technician</h2>
            <p className="text-graphite-400 text-sm">
              View jobs, access knowledge base, track performance
            </p>
          </a>

          {/* Customer Dashboard */}
          <a
            href="/dashboard/customer"
            className="glass rounded-2xl p-8 hover:border-accent-500 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">👤</div>
            <h2 className="text-2xl font-bold mb-2">Customer</h2>
            <p className="text-graphite-400 text-sm">
              Track devices, repairs, warranties, and history
            </p>
          </a>

          {/* Supplier Dashboard */}
          <a
            href="/dashboard/supplier"
            className="glass rounded-2xl p-8 hover:border-accent-500 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📦</div>
            <h2 className="text-2xl font-bold mb-2">Supplier</h2>
            <p className="text-graphite-400 text-sm">
              Manage inventory, orders, and marketplace
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
