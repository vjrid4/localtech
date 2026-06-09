export default function SupplierDashboard() {
  return (
    <div className="min-h-screen bg-graphite-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Supplier Marketplace</h1>

        {/* Business Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Total Orders</div>
            <div className="text-3xl font-bold text-accent-500">342</div>
            <div className="text-xs text-graphite-500 mt-2">↑ 24 this month</div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Revenue (This Month)</div>
            <div className="text-3xl font-bold text-accent-500">₹18.5L</div>
            <div className="text-xs text-graphite-500 mt-2">↑ 18% from last month</div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Seller Rating</div>
            <div className="text-3xl font-bold text-accent-500">4.7★</div>
            <div className="text-xs text-graphite-500 mt-2">Based on 256 reviews</div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Active Products</div>
            <div className="text-3xl font-bold text-accent-500">156</div>
            <div className="text-xs text-graphite-500 mt-2">All verified</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 glass rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
            <div className="space-y-4">
              {[
                { orderId: "ORD-2024-001", buyer: "TechRepair Shop", amount: "₹45,000", status: "SHIPPED", date: "2 days ago" },
                { orderId: "ORD-2024-002", buyer: "Quick Fix Mobile", amount: "₹32,500", status: "PROCESSING", date: "4 days ago" },
                { orderId: "ORD-2024-003", buyer: "Device Care Center", amount: "₹28,000", status: "DELIVERED", date: "1 week ago" },
              ].map((order, i) => (
                <div key={i} className="border-b border-graphite-800 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold">{order.orderId}</p>
                      <p className="text-sm text-graphite-400">{order.buyer}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === "SHIPPED" ? "bg-blue-500 bg-opacity-20 text-blue-300" :
                      order.status === "PROCESSING" ? "bg-yellow-500 bg-opacity-20 text-yellow-300" :
                      "bg-green-500 bg-opacity-20 text-green-300"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-graphite-400">
                    <span>{order.amount}</span>
                    <span>{order.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions & Analytics */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Management</h2>
            <div className="space-y-3 mb-6">
              <button className="w-full px-4 py-3 bg-accent-500 text-graphite-950 font-bold rounded-lg hover:bg-accent-400 transition">
                Add Product
              </button>
              <button className="w-full px-4 py-3 glass border border-accent-500 text-white font-bold rounded-lg hover:bg-opacity-10 transition">
                Manage Inventory
              </button>
              <button className="w-full px-4 py-3 glass border border-accent-500 text-white font-bold rounded-lg hover:bg-opacity-10 transition">
                View Analytics
              </button>
            </div>

            <h3 className="font-bold mb-4 text-sm text-graphite-400">TOP PRODUCTS</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>iPhone Screens</span>
                <span className="text-accent-500 font-bold">142 sold</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Battery Packs</span>
                <span className="text-accent-500 font-bold">98 sold</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Charging Ports</span>
                <span className="text-accent-500 font-bold">87 sold</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
