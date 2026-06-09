export default function Footer() {
  return (
    <footer className="bg-graphite-900 border-t border-graphite-800 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="gradient-text-accent">DeviceDNA</span>
            </h3>
            <p className="text-graphite-400 text-sm">
              AI-powered mobile repair intelligence platform for the future of device management.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-graphite-400 text-sm">
              <li><a href="#" className="hover:text-accent-500 transition">Features</a></li>
              <li><a href="#" className="hover:text-accent-500 transition">Pricing</a></li>
              <li><a href="#" className="hover:text-accent-500 transition">Security</a></li>
              <li><a href="#" className="hover:text-accent-500 transition">Roadmap</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-graphite-400 text-sm">
              <li><a href="#" className="hover:text-accent-500 transition">About</a></li>
              <li><a href="#" className="hover:text-accent-500 transition">Blog</a></li>
              <li><a href="#" className="hover:text-accent-500 transition">Careers</a></li>
              <li><a href="#" className="hover:text-accent-500 transition">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-graphite-400 text-sm">
              <li><a href="#" className="hover:text-accent-500 transition">Privacy</a></li>
              <li><a href="#" className="hover:text-accent-500 transition">Terms</a></li>
              <li><a href="#" className="hover:text-accent-500 transition">Cookies</a></li>
              <li><a href="#" className="hover:text-accent-500 transition">Compliance</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-graphite-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-graphite-500 text-sm mb-4 md:mb-0">
            © 2026 DeviceDNA. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-graphite-400 hover:text-accent-500 transition">Twitter</a>
            <a href="#" className="text-graphite-400 hover:text-accent-500 transition">LinkedIn</a>
            <a href="#" className="text-graphite-400 hover:text-accent-500 transition">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
