"use client";

import { useState } from "react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="glass rounded-b-2xl mx-4 mt-2">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="gradient-text-accent">DeviceDNA</span>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm hover:text-accent-500 transition">Products</a>
            <a href="#" className="text-sm hover:text-accent-500 transition">Solutions</a>
            <a href="#" className="text-sm hover:text-accent-500 transition">Pricing</a>
            <a href="#" className="text-sm hover:text-accent-500 transition">Docs</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="text-sm px-4 py-2 hover:text-accent-500 transition">
              Sign In
            </button>
            <button className="text-sm px-4 py-2 bg-accent-500 text-graphite-950 font-bold rounded-lg hover:bg-accent-400 transition">
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-graphite-700 p-6 space-y-4">
            <a href="#" className="block text-sm hover:text-accent-500 transition">Products</a>
            <a href="#" className="block text-sm hover:text-accent-500 transition">Solutions</a>
            <a href="#" className="block text-sm hover:text-accent-500 transition">Pricing</a>
            <button className="w-full px-4 py-2 bg-accent-500 text-graphite-950 font-bold rounded-lg hover:bg-accent-400 transition">
              Get Started
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
