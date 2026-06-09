export default function ShopDashboard() {
  return (
    <div className="min-h-screen bg-graphite-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Repair Shop Dashboard</h1>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Active Repairs</div>
            <div className="text-3xl font-bold text-accent-500">24</div>
            <div className="text-xs text-graphite-500 mt-2">↑ 3 since yesterday</div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Revenue (This Month)</div>
            <div className="text-3xl font-bold text-accent-500">₹2.4L</div>
            <div className="text-xs text-graphite-500 mt-2">↑ 12% from last month</div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Customer Satisfaction</div>
            <div className="text-3xl font-bold text-accent-500">4.8★</div>
            <div className="text-xs text-graphite-500 mt-2">Based on 156 reviews</div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Active Technicians</div>
            <div className="text-3xl font-bold text-accent-500">8</div>
            <div className="text-xs text-graphite-500 mt-2">All certified</div>
          </div>
        </div>

        {/* Main content areas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Repairs */}
          <div className="lg:col-span-2 glass rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Recent Repairs</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-graphite-800 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold">iPhone 14 Pro Max - Screen Replacement</p>
                      <p className="text-sm text-graphite-400">Customer: John Doe</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-accent-500 bg-opacity-20 text-accent-300">
                      IN PROGRESS
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-graphite-400">
                    <span>Est. ₹8,500</span>
                    <span>Tech: Raj Kumar</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-accent-500 text-graphite-950 font-bold rounded-lg hover:bg-accent-400 transition">
                New Repair
              </button>
              <button className="w-full px-4 py-3 glass border border-accent-500 text-white font-bold rounded-lg hover:bg-opacity-10 transition">
                Add Technician
              </button>
              <button className="w-full px-4 py-3 glass border border-accent-500 text-white font-bold rounded-lg hover:bg-opacity-10 transition">
                View Inventory
              </button>
              <button className="w-full px-4 py-3 glass border border-accent-500 text-white font-bold rounded-lg hover:bg-opacity-10 transition">
                Generate Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
