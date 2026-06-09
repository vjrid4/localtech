export default function TechnicianDashboard() {
  return (
    <div className="min-h-screen bg-graphite-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Technician Workspace</h1>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Today's Jobs</div>
            <div className="text-3xl font-bold text-accent-500">6</div>
            <div className="text-xs text-graphite-500 mt-2">3 completed</div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Avg Rating</div>
            <div className="text-3xl font-bold text-accent-500">4.9★</div>
            <div className="text-xs text-graphite-500 mt-2">42 reviews</div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Total Repairs</div>
            <div className="text-3xl font-bold text-accent-500">487</div>
            <div className="text-xs text-graphite-500 mt-2">Success rate: 98%</div>
          </div>
          <div className="glass rounded-xl p-6">
            <div className="text-sm text-graphite-400 mb-2">Certifications</div>
            <div className="text-3xl font-bold text-accent-500">12</div>
            <div className="text-xs text-graphite-500 mt-2">All current</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Queue */}
          <div className="lg:col-span-2 glass rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Today's Job Queue</h2>
            <div className="space-y-4">
              {[
                { priority: "URGENT", device: "iPhone 13 - Screen Repair", customer: "Priya Singh", time: "11:30 AM" },
                { priority: "HIGH", device: "Samsung Galaxy A52 - Battery", customer: "Amit Kumar", time: "2:00 PM" },
                { priority: "MEDIUM", device: "OnePlus 10 - Software Issue", customer: "Rohan Patel", time: "3:30 PM" },
              ].map((job, i) => (
                <div key={i} className="border-l-4 border-accent-500 pl-4 py-3 hover:bg-graphite-800 bg-opacity-50 rounded transition cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        job.priority === "URGENT" ? "bg-red-500 bg-opacity-20 text-red-300" :
                        job.priority === "HIGH" ? "bg-orange-500 bg-opacity-20 text-orange-300" :
                        "bg-yellow-500 bg-opacity-20 text-yellow-300"
                      }`}>
                        {job.priority}
                      </span>
                      <p className="font-bold mt-2">{job.device}</p>
                    </div>
                    <p className="text-sm text-graphite-400">{job.time}</p>
                  </div>
                  <p className="text-sm text-graphite-400">Customer: {job.customer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge & Tools */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-accent-500 text-graphite-950 font-bold rounded-lg hover:bg-accent-400 transition">
                AI Diagnostics
              </button>
              <button className="w-full px-4 py-3 glass border border-accent-500 text-white font-bold rounded-lg hover:bg-opacity-10 transition">
                Schematics Library
              </button>
              <button className="w-full px-4 py-3 glass border border-accent-500 text-white font-bold rounded-lg hover:bg-opacity-10 transition">
                Hardware Solutions
              </button>
              <button className="w-full px-4 py-3 glass border border-accent-500 text-white font-bold rounded-lg hover:bg-opacity-10 transition">
                Training Academy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
