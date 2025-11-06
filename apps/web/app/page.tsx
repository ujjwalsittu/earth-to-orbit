'use client';

import Link from 'next/link';
import { ArrowRight, Satellite, Zap, Shield, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-blue-900/20 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Satellite className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">Earth To Orbit</span>
          </div>
          <nav className="hidden space-x-6 md:flex">
            <Link href="#features" className="text-sm text-gray-300 hover:text-white transition">
              Features
            </Link>
            <Link href="#services" className="text-sm text-gray-300 hover:text-white transition">
              Services
            </Link>
            <Link href="#about" className="text-sm text-gray-300 hover:text-white transition">
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm text-gray-300 hover:text-white transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          {/* Animated Background */}
          <div className="absolute inset-0">
            {/* Earth Placeholder */}
            <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 opacity-20 blur-3xl animate-float" />

            {/* Orbit Rings */}
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/20 animate-orbit" />
            <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/10 animate-orbit" style={{ animationDuration: '30s' }} />

            {/* Satellite Icons */}
            <div className="absolute left-[20%] top-[30%] animate-float">
              <Satellite className="h-8 w-8 text-blue-400 opacity-50" />
            </div>
            <div className="absolute right-[25%] top-[40%] animate-float" style={{ animationDelay: '2s' }}>
              <Satellite className="h-6 w-6 text-blue-400 opacity-30" />
            </div>
            <div className="absolute left-[70%] top-[60%] animate-float" style={{ animationDelay: '4s' }}>
              <Satellite className="h-7 w-7 text-blue-400 opacity-40" />
            </div>
          </div>

          {/* Hero Content */}
          <div className="container relative z-10 px-4 text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl">
              Aerospace Infrastructure
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                On Demand
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300 md:text-xl">
              Access world-class testing facilities, machinery, and expertise for your satellite
              manufacturing needs. Book time-boxed sessions with transparent pricing.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-medium text-white hover:bg-blue-700 transition"
              >
                Start Your Project
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#features"
                className="rounded-lg border border-blue-500/50 px-8 py-4 text-lg font-medium text-white hover:bg-blue-500/10 transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4">
          <div className="container mx-auto">
            <h2 className="mb-16 text-center text-4xl font-bold text-white">
              Everything You Need for Mission Success
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-blue-500/20 bg-slate-900/50 p-6 backdrop-blur">
                <Zap className="mb-4 h-12 w-12 text-blue-400" />
                <h3 className="mb-2 text-xl font-semibold text-white">Instant Booking</h3>
                <p className="text-gray-400">
                  Real-time availability and instant booking confirmation for all facilities
                </p>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-slate-900/50 p-6 backdrop-blur">
                <Clock className="mb-4 h-12 w-12 text-blue-400" />
                <h3 className="mb-2 text-xl font-semibold text-white">Flexible Scheduling</h3>
                <p className="text-gray-400">
                  Book by the hour with options to extend based on capacity
                </p>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-slate-900/50 p-6 backdrop-blur">
                <Shield className="mb-4 h-12 w-12 text-blue-400" />
                <h3 className="mb-2 text-xl font-semibold text-white">Expert Support</h3>
                <p className="text-gray-400">
                  Trained technicians and engineers available for assistance
                </p>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-slate-900/50 p-6 backdrop-blur">
                <Satellite className="mb-4 h-12 w-12 text-blue-400" />
                <h3 className="mb-2 text-xl font-semibold text-white">Premium Equipment</h3>
                <p className="text-gray-400">
                  TVAC chambers, vibration tables, cleanrooms, and more
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="bg-slate-900/30 py-24 px-4">
          <div className="container mx-auto">
            <h2 className="mb-16 text-center text-4xl font-bold text-white">
              Our Facilities
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-xl border border-blue-500/20 bg-slate-900/80 p-8">
                <h3 className="mb-4 text-2xl font-semibold text-white">
                  Environmental Testing
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>• TVAC Chambers</li>
                  <li>• Thermal Cycling</li>
                  <li>• Humidity Testing</li>
                  <li>• Altitude Simulation</li>
                </ul>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-slate-900/80 p-8">
                <h3 className="mb-4 text-2xl font-semibold text-white">
                  Vibration & Shock
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>• Electrodynamic Shakers</li>
                  <li>• Random Vibration</li>
                  <li>• Sine Testing</li>
                  <li>• Shock Testing</li>
                </ul>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-slate-900/80 p-8">
                <h3 className="mb-4 text-2xl font-semibold text-white">
                  Cleanrooms & Assembly
                </h3>
                <ul className="space-y-2 text-gray-400">
                  <li>• ISO 7 Cleanrooms</li>
                  <li>• Integration Facilities</li>
                  <li>• ESD Protected Areas</li>
                  <li>• Quality Control</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto text-center">
            <h2 className="mb-6 text-4xl font-bold text-white">
              Ready to Launch Your Next Mission?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
              Join leading aerospace companies using Earth To Orbit for their testing and
              manufacturing needs
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-medium text-white hover:bg-blue-700 transition"
            >
              Create Your Account
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-900/20 bg-slate-950/80 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <Satellite className="h-6 w-6 text-blue-400" />
                <span className="font-bold text-white">Earth To Orbit</span>
              </div>
              <p className="text-sm text-gray-400">
                B2B aerospace infrastructure platform
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/catalog" className="hover:text-white transition">
                    Browse Catalog
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-white transition">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white transition">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-blue-900/20 pt-8 text-center text-sm text-gray-400">
            © 2024 Earth To Orbit. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
