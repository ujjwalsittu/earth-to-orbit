'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Satellite, Zap, Shield, Clock, CheckCircle,
  Radio, Thermometer, Activity, Users, TrendingUp, Globe,
  Award, Target, Rocket, Star
} from 'lucide-react';

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-blue-900/20 bg-slate-950/95 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Satellite className="h-8 w-8 text-blue-400 animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 text-blue-400 animate-ping opacity-20">
                <Satellite className="h-8 w-8" />
              </div>
            </div>
            <span className="text-xl font-bold text-white">Earth To Orbit</span>
          </div>
          <nav className="hidden space-x-6 md:flex">
            <Link href="#problem" className="text-sm text-gray-300 hover:text-white transition">
              Why E2O
            </Link>
            <Link href="#solutions" className="text-sm text-gray-300 hover:text-white transition">
              Solutions
            </Link>
            <Link href="#facilities" className="text-sm text-gray-300 hover:text-white transition">
              Facilities
            </Link>
            <Link href="#pricing" className="text-sm text-gray-300 hover:text-white transition">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm text-gray-300 hover:text-white transition">
              Customers
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
              className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-cyan-700 transition shadow-lg shadow-blue-500/30"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section with Advanced Satellite Animation */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          {/* Animated Space Background */}
          <div className="absolute inset-0">
            {/* Stars */}
            <div className="absolute inset-0">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-1 w-1 bg-white rounded-full animate-twinkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    opacity: Math.random() * 0.7 + 0.3
                  }}
                />
              ))}
            </div>

            {/* Earth */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative h-96 w-96">
                {/* Earth Core */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900 opacity-30 blur-2xl animate-pulse-slow" />

                {/* Earth Surface */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-500 via-cyan-600 to-blue-800 animate-rotate-slow shadow-2xl shadow-blue-500/50">
                  {/* Continents effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-600/40 via-transparent to-green-700/30"></div>
                  {/* Clouds */}
                  <div className="absolute inset-0 rounded-full bg-white/5 animate-spin-slow"></div>
                  {/* Atmosphere glow */}
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 blur-xl"></div>
                </div>

                {/* Orbit Rings */}
                <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-full scale-150 animate-orbit"></div>
                <div className="absolute inset-0 border-2 border-blue-400/10 rounded-full scale-[2] animate-orbit-slow"></div>
                <div className="absolute inset-0 border border-purple-400/10 rounded-full scale-[2.5] animate-orbit-reverse"></div>

                {/* Orbiting Satellites with communication beams */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {/* Satellite 1 */}
                  <div className="absolute animate-orbit-satellite-1">
                    <div className="relative -translate-x-[200px]">
                      <Satellite className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      {/* Communication beam */}
                      <div className="absolute top-1/2 left-1/2 w-[200px] h-0.5 bg-gradient-to-r from-cyan-400/60 to-transparent origin-left rotate-45 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Satellite 2 */}
                  <div className="absolute animate-orbit-satellite-2">
                    <div className="relative -translate-x-[240px]">
                      <Satellite className="h-6 w-6 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                      <div className="absolute top-1/2 left-1/2 w-[240px] h-0.5 bg-gradient-to-r from-blue-400/50 to-transparent origin-left -rotate-30 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Satellite 3 */}
                  <div className="absolute animate-orbit-satellite-3">
                    <div className="relative -translate-x-[180px]">
                      <Satellite className="h-7 w-7 text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                      <div className="absolute top-1/2 left-1/2 w-[180px] h-0.5 bg-gradient-to-r from-purple-400/60 to-transparent origin-left rotate-90 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Satellite 4 - CubeSat */}
                  <div className="absolute animate-orbit-satellite-4">
                    <div className="relative -translate-x-[220px]">
                      <div className="h-5 w-5 bg-gradient-to-br from-orange-400 to-red-500 rounded-sm rotate-45 drop-shadow-[0_0_6px_rgba(251,146,60,0.8)] animate-spin-slow"></div>
                    </div>
                  </div>
                </div>

                {/* Ground Station Signals */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8">
                  <div className="relative">
                    <Radio className="h-6 w-6 text-emerald-400 animate-pulse" />
                    <div className="absolute -top-20 left-1/2 w-0.5 h-20 bg-gradient-to-t from-emerald-400/60 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="container relative z-10 px-4 text-center">
            <div className="inline-block mb-4 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 backdrop-blur-sm">
              <span className="text-sm text-blue-300 font-medium">🚀 Trusted by 50+ Satellite Manufacturers</span>
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl leading-tight">
              Stop Waiting Months for
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 animate-gradient">
                Satellite Testing
              </span>
            </h1>

            <p className="mx-auto mb-4 max-w-3xl text-xl text-gray-300 md:text-2xl leading-relaxed">
              Book TVAC chambers, vibration tables, and cleanrooms <span className="text-cyan-400 font-semibold">instantly</span>.
              <br />
              Pay only for what you use. Launch faster.
            </p>

            <div className="flex items-center justify-center gap-8 mb-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Book in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>No long-term contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>30-day free trial</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-lg font-semibold text-white hover:from-blue-700 hover:to-cyan-700 transition shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transform"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#problem"
                className="flex items-center gap-2 rounded-xl border-2 border-blue-500/50 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-500/10 transition backdrop-blur-sm"
              >
                See How It Works
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-8 opacity-60">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-gray-400">Tests Completed</div>
              </div>
              <div className="h-12 w-px bg-gray-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm text-gray-400">Satellite Companies</div>
              </div>
              <div className="h-12 w-px bg-gray-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-sm text-gray-400">Uptime SLA</div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section id="problem" className="py-24 px-4 bg-slate-900/30">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30">
                <span className="text-sm text-red-300 font-medium">The Old Way Is Broken</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Satellite Testing Shouldn't Be This Hard
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Traditional testing facilities create bottlenecks that delay launches by months
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition"></div>
                <div className="relative rounded-2xl border border-red-500/30 bg-slate-900/80 backdrop-blur p-8">
                  <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-500/20 border-2 border-red-500">
                    <Clock className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">3-6 Month Wait Times</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Book months in advance or miss your launch window. Competitors get to market first while you're stuck in queue.
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-yellow-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition"></div>
                <div className="relative rounded-2xl border border-orange-500/30 bg-slate-900/80 backdrop-blur p-8">
                  <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-orange-500/20 border-2 border-orange-500">
                    <TrendingUp className="h-8 w-8 text-orange-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Pay For Unused Time</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Forced to book full days even if you need 2 hours. Locked into expensive annual contracts you can't escape.
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition"></div>
                <div className="relative rounded-2xl border border-yellow-500/30 bg-slate-900/80 backdrop-blur p-8">
                  <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-yellow-500/20 border-2 border-yellow-500">
                    <Target className="h-8 w-8 text-yellow-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Zero Flexibility</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Test runs over? Pay penalty fees or lose your data. Need to reschedule? Start the 6-month wait again.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-16 text-center">
              <p className="text-2xl text-gray-300 font-semibold mb-2">There's a better way.</p>
              <div className="flex items-center justify-center">
                <div className="h-1 w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-24 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
                <span className="text-sm text-green-300 font-medium">The E2O Advantage</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Book Testing Facilities Like You Book Cloud Servers
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                On-demand access to world-class satellite testing infrastructure
              </p>
            </div>

            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition"></div>
                <div className="relative rounded-2xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur p-8 hover:border-cyan-400/50 transition">
                  <div className="relative mb-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500">
                      <Zap className="h-8 w-8 text-cyan-400" />
                    </div>
                    <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Instant Booking</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    See real-time availability and book in minutes. No phone calls, no email chains, no waiting weeks for quotes.
                  </p>
                  <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    <span>Book in under 5 minutes</span>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition"></div>
                <div className="relative rounded-2xl border border-blue-500/30 bg-slate-900/80 backdrop-blur p-8 hover:border-blue-400/50 transition">
                  <div className="relative mb-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500">
                      <Clock className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="absolute top-0 right-0 h-16 w-16 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Pay Per Hour</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Book exactly what you need. Need 4 hours? Pay for 4 hours. Test finishes early? No penalty fees.
                  </p>
                  <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    <span>No long-term contracts</span>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition"></div>
                <div className="relative rounded-2xl border border-purple-500/30 bg-slate-900/80 backdrop-blur p-8 hover:border-purple-400/50 transition">
                  <div className="relative mb-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-500">
                      <Rocket className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="absolute top-0 right-0 h-16 w-16 bg-purple-400/20 rounded-full blur-xl animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Extend Anytime</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Test taking longer? Extend your booking in real-time if capacity is available. No rescheduling nightmare.
                  </p>
                  <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    <span>One-click extensions</span>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition"></div>
                <div className="relative rounded-2xl border border-green-500/30 bg-slate-900/80 backdrop-blur p-8 hover:border-green-400/50 transition">
                  <div className="relative mb-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500">
                      <Shield className="h-8 w-8 text-green-400" />
                    </div>
                    <div className="absolute top-0 right-0 h-16 w-16 bg-green-400/20 rounded-full blur-xl animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Expert Support</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Trained aerospace technicians on-site. Real-time monitoring, data validation, and emergency support included.
                  </p>
                  <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    <span>24/7 technical assistance</span>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition"></div>
                <div className="relative rounded-2xl border border-yellow-500/30 bg-slate-900/80 backdrop-blur p-8 hover:border-yellow-400/50 transition">
                  <div className="relative mb-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500">
                      <Globe className="h-8 w-8 text-yellow-400" />
                    </div>
                    <div className="absolute top-0 right-0 h-16 w-16 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Real-Time Data</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Access test data, temperature logs, and vibration profiles through our dashboard. Download anytime, anywhere.
                  </p>
                  <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    <span>Cloud data access</span>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition"></div>
                <div className="relative rounded-2xl border border-pink-500/30 bg-slate-900/80 backdrop-blur p-8 hover:border-pink-400/50 transition">
                  <div className="relative mb-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/20 border-2 border-pink-500">
                      <Award className="h-8 w-8 text-pink-400" />
                    </div>
                    <div className="absolute top-0 right-0 h-16 w-16 bg-pink-400/20 rounded-full blur-xl animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Certified Equipment</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    All facilities meet NASA, ESA, and ISRO standards. Full calibration certificates and test reports provided.
                  </p>
                  <div className="flex items-center gap-2 text-pink-400 text-sm font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    <span>Certification included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Facilities Section */}
        <section id="facilities" className="bg-slate-900/30 py-24 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30">
                <span className="text-sm text-blue-300 font-medium">World-Class Infrastructure</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Equipment Built for Space
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                From CubeSats to communication satellites, we have the testing infrastructure you need
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {/* TVAC Chambers */}
              <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-slate-900 to-blue-900/20 p-8 hover:border-blue-400/50 transition group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Thermometer className="h-12 w-12 text-cyan-400" />
                    <div className="absolute inset-0 blur-xl bg-cyan-400/30 animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">TVAC Chambers</h3>
                    <p className="text-cyan-400 text-sm">Thermal Vacuum Testing</p>
                  </div>
                </div>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Temperature Range:</span> -180°C to +150°C</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Vacuum Level:</span> 10⁻⁶ Torr</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Chamber Size:</span> 3m x 2m x 2m</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Payload:</span> Up to 500 kg</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span>Real-time thermal monitoring with 20+ sensors</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-blue-500/20">
                  <p className="text-sm text-gray-400">Ideal for: LEO/GEO satellites, thermal qualification, space simulation</p>
                </div>
              </div>

              {/* Vibration Tables */}
              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900 to-purple-900/20 p-8 hover:border-purple-400/50 transition group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Activity className="h-12 w-12 text-purple-400" />
                    <div className="absolute inset-0 blur-xl bg-purple-400/30 animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Vibration Tables</h3>
                    <p className="text-purple-400 text-sm">Launch Simulation</p>
                  </div>
                </div>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Force:</span> 50 kN electrodynamic shaker</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Frequency:</span> 5 Hz to 2000 Hz</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Payload:</span> Up to 300 kg</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Axes:</span> 3-axis testing capability</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Random, sine, and shock testing profiles</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-purple-500/20">
                  <p className="text-sm text-gray-400">Ideal for: Launch qualification, structural testing, component validation</p>
                </div>
              </div>

              {/* ISO Cleanrooms */}
              <div className="rounded-2xl border border-green-500/30 bg-gradient-to-br from-slate-900 to-green-900/20 p-8 hover:border-green-400/50 transition group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Shield className="h-12 w-12 text-green-400" />
                    <div className="absolute inset-0 blur-xl bg-green-400/30 animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">ISO Cleanrooms</h3>
                    <p className="text-green-400 text-sm">Satellite Assembly</p>
                  </div>
                </div>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Classification:</span> ISO 7 (Class 10,000)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Size:</span> 200 sq m with 4m ceiling</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Control:</span> Temperature & humidity controlled</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Safety:</span> Full ESD protection</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Overhead crane system for satellite handling</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-green-500/20">
                  <p className="text-sm text-gray-400">Ideal for: Satellite integration, payload assembly, precision work</p>
                </div>
              </div>

              {/* EMC Testing */}
              <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-slate-900 to-yellow-900/20 p-8 hover:border-yellow-400/50 transition group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Radio className="h-12 w-12 text-yellow-400" />
                    <div className="absolute inset-0 blur-xl bg-yellow-400/30 animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">EMC Testing</h3>
                    <p className="text-yellow-400 text-sm">Electromagnetic Compatibility</p>
                  </div>
                </div>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Facility:</span> 10m x 8m x 6m anechoic chamber</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Frequency:</span> 10 kHz to 40 GHz</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Standards:</span> MIL-STD-461, DO-160</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Testing:</span> Radiated & conducted emissions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>RF interference and susceptibility analysis</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-yellow-500/20">
                  <p className="text-sm text-gray-400">Ideal for: Communication satellites, payload validation, certification</p>
                </div>
              </div>

              {/* Acoustic Testing */}
              <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-br from-slate-900 to-pink-900/20 p-8 hover:border-pink-400/50 transition group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Zap className="h-12 w-12 text-pink-400" />
                    <div className="absolute inset-0 blur-xl bg-pink-400/30 animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Acoustic Testing</h3>
                    <p className="text-pink-400 text-sm">Launch Noise Simulation</p>
                  </div>
                </div>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-pink-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">SPL:</span> Up to 160 dB</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-pink-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Chamber:</span> Reverberant acoustic chamber</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-pink-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Frequency:</span> 31.5 Hz to 10 kHz</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-pink-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Payload:</span> Up to 1000 kg</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-pink-400 mt-0.5 flex-shrink-0" />
                    <span>Simulates launch vehicle fairing environment</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-pink-500/20">
                  <p className="text-sm text-gray-400">Ideal for: Large satellites, structural qualification, launch readiness</p>
                </div>
              </div>

              {/* Solar Simulation */}
              <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-slate-900 to-orange-900/20 p-8 hover:border-orange-400/50 transition group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <Star className="h-12 w-12 text-orange-400" />
                    <div className="absolute inset-0 blur-xl bg-orange-400/30 animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Solar Simulation</h3>
                    <p className="text-orange-400 text-sm">Power System Testing</p>
                  </div>
                </div>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Spectrum:</span> AM0 solar spectrum match</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Intensity:</span> 1 solar constant (1367 W/m²)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Area:</span> 2m x 2m illumination area</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span><span className="font-semibold">Uniformity:</span> ±2% across test area</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span>Solar panel I-V curve characterization</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-orange-500/20">
                  <p className="text-sm text-gray-400">Ideal for: Solar panel testing, power budget validation, thermal balance</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                <span className="text-sm text-cyan-300 font-medium">Transparent Pricing</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Pay For What You Use
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                No hidden fees. No annual contracts. Just simple hourly rates.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {/* TVAC Pricing */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-2xl blur-xl"></div>
                <div className="relative rounded-2xl border border-cyan-500/30 bg-slate-900/90 backdrop-blur p-8">
                  <div className="mb-6">
                    <Thermometer className="h-10 w-10 text-cyan-400 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">TVAC Chambers</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-cyan-400">₹25,000</span>
                      <span className="text-gray-400">/hour</span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-gray-300 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                      <span>Full thermal vacuum testing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                      <span>Real-time monitoring</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                      <span>Data export & reports</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                      <span>Technician support</span>
                    </li>
                  </ul>
                  <Link
                    href="/register"
                    className="block w-full text-center rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-white font-semibold hover:from-cyan-700 hover:to-blue-700 transition"
                  >
                    Book Now
                  </Link>
                </div>
              </div>

              {/* Vibration Pricing */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl"></div>
                <div className="relative rounded-2xl border border-purple-500/30 bg-slate-900/90 backdrop-blur p-8">
                  <div className="mb-6">
                    <Activity className="h-10 w-10 text-purple-400 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Vibration Tables</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-purple-400">₹18,000</span>
                      <span className="text-gray-400">/hour</span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-gray-300 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-400 flex-shrink-0" />
                      <span>3-axis vibration testing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-400 flex-shrink-0" />
                      <span>Random & sine profiles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-400 flex-shrink-0" />
                      <span>Shock testing included</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-400 flex-shrink-0" />
                      <span>Accelerometer setup</span>
                    </li>
                  </ul>
                  <Link
                    href="/register"
                    className="block w-full text-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                  >
                    Book Now
                  </Link>
                </div>
              </div>

              {/* Cleanroom Pricing */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-cyan-600/20 rounded-2xl blur-xl"></div>
                <div className="relative rounded-2xl border border-green-500/30 bg-slate-900/90 backdrop-blur p-8">
                  <div className="mb-6">
                    <Shield className="h-10 w-10 text-green-400 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">ISO Cleanrooms</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-green-400">₹12,000</span>
                      <span className="text-gray-400">/hour</span>
                    </div>
                  </div>
                  <ul className="space-y-3 text-gray-300 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span>ISO 7 certified space</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span>ESD protection included</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span>Climate controlled</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span>Overhead crane access</span>
                    </li>
                  </ul>
                  <Link
                    href="/register"
                    className="block w-full text-center rounded-xl bg-gradient-to-r from-green-600 to-cyan-600 px-6 py-3 text-white font-semibold hover:from-green-700 hover:to-cyan-700 transition"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-400 mb-4">Volume discounts available for 100+ hours</p>
              <div className="inline-flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">No setup fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">30-day trial available</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="bg-slate-900/30 py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30">
                <span className="text-sm text-blue-300 font-medium">Trusted by Leaders</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                What Our Customers Say
              </h2>
            </div>

            <div className="relative">
              {/* Testimonial 1 */}
              <div
                className={`transition-opacity duration-500 ${
                  activeTestimonial === 0 ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              >
                <div className="rounded-2xl border border-blue-500/30 bg-slate-900/80 backdrop-blur p-12 text-center">
                  <div className="flex justify-center mb-6">
                    <Users className="h-16 w-16 text-blue-400" />
                  </div>
                  <p className="text-xl text-gray-300 leading-relaxed mb-8 italic">
                    "E2O cut our testing turnaround time from 4 months to 2 weeks. The instant booking and pay-per-hour model is exactly what the industry needed. We've tested 3 satellites with them so far."
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="font-bold text-white text-lg">Dr. Rajesh Kumar</p>
                  <p className="text-cyan-400">CTO, Skyward Aerospace</p>
                  <p className="text-sm text-gray-500 mt-2">LEO Communications Satellites</p>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div
                className={`transition-opacity duration-500 ${
                  activeTestimonial === 1 ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              >
                <div className="rounded-2xl border border-purple-500/30 bg-slate-900/80 backdrop-blur p-12 text-center">
                  <div className="flex justify-center mb-6">
                    <Rocket className="h-16 w-16 text-purple-400" />
                  </div>
                  <p className="text-xl text-gray-300 leading-relaxed mb-8 italic">
                    "The TVAC chamber data quality is exceptional. Real-time monitoring saved us when we discovered a thermal issue 6 hours into testing. Extended our booking instantly and fixed the problem. Worth every rupee."
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="font-bold text-white text-lg">Priya Sharma</p>
                  <p className="text-purple-400">Lead Engineer, OrbitTech Solutions</p>
                  <p className="text-sm text-gray-500 mt-2">Earth Observation Satellites</p>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div
                className={`transition-opacity duration-500 ${
                  activeTestimonial === 2 ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
              >
                <div className="rounded-2xl border border-green-500/30 bg-slate-900/80 backdrop-blur p-12 text-center">
                  <div className="flex justify-center mb-6">
                    <Satellite className="h-16 w-16 text-green-400" />
                  </div>
                  <p className="text-xl text-gray-300 leading-relaxed mb-8 italic">
                    "As a startup, we can't commit to expensive annual contracts. E2O's pay-per-use model let us test our CubeSat prototype without breaking the bank. The technicians were incredibly helpful too."
                  </p>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="font-bold text-white text-lg">Amit Verma</p>
                  <p className="text-green-400">Founder, NanoSat Innovations</p>
                  <p className="text-sm text-gray-500 mt-2">CubeSat Constellation</p>
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center gap-3 mt-8">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`h-3 rounded-full transition-all ${
                      activeTestimonial === index
                        ? 'w-12 bg-blue-400'
                        : 'w-3 bg-gray-600 hover:bg-gray-500'
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-purple-600/20 rounded-3xl blur-2xl"></div>
              <div className="relative rounded-3xl border border-blue-500/30 bg-slate-900/80 backdrop-blur p-16">
                <Rocket className="h-16 w-16 text-cyan-400 mx-auto mb-6 animate-pulse" />
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Ready to Test Your Satellite?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join 50+ aerospace companies who have already launched faster with E2O. Start your free 30-day trial today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-lg font-semibold text-white hover:from-blue-700 hover:to-cyan-700 transition shadow-2xl shadow-blue-500/30 hover:scale-105 transform"
                  >
                    Start Free Trial
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-blue-500/50 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-500/10 transition backdrop-blur-sm"
                  >
                    Sign In
                  </Link>
                </div>
                <p className="mt-6 text-sm text-gray-400">
                  No credit card required • Book in 5 minutes • Cancel anytime
                </p>
              </div>
            </div>
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
