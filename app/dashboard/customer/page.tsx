export default function CustomerDashboard() {
  return (
    <div className="min-h-screen bg-graphite-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Devices & Repairs</h1>

        {/* Device Health Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Total Devices</div>
            <div className="text-3xl font-bold text-accent-500">3</div>
            <div className="text-xs text-graphite-500 mt-2">All registered</div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Repairs This Year</div>
            <div className="text-3xl font-bold text-accent-500">5</div>
            <div className="text-xs text-graphite-500 mt-2">All completed</div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Active Warranties</div>
            <div className="text-3xl font-bold text-accent-500">2</div>
            <div className="text-xs text-graphite-500 mt-2">Valid until Dec 2026</div>
          </div>
        </div>

        {/* My Devices */}
        <div className="glass rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6">My Devices</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["iPhone 14 Pro", "Samsung Galaxy S23", "iPad Air"].map((device, i) => (
              <div key={i} className="border border-graphite-700 rounded-lg p-4 hover:border-accent-500 transition cursor-pointer">
                <div className="text-3xl mb-3">📱</div>
                <p className="font-bold mb-1">{device}</p>
                <div className="space-y-1 text-sm text-graphite-400">
                  <p>Health: <span className="text-accent-500 font-bold">92%</span></p>
                  <p>Last Repair: 2 months ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Repairs */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Repairs</h2>
          <div className="space-y-4">
            {[
              { device: "iPhone 14 Pro", issue: "Screen Replacement", status: "Completed", date: "2 weeks ago" },
              { device: "Samsung Galaxy S23", issue: "Battery Replacement", status: "Completed", date: "1 month ago" },
            ].map((repair, i) => (
              <div key={i} className="border-b border-graphite-800 pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{repair.device}</p>
                    <p className="text-sm text-graphite-400">{repair.issue}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 bg-opacity-20 text-green-300">
                      {repair.status}
                    </span>
                    <p className="text-xs text-graphite-500 mt-1">{repair.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
