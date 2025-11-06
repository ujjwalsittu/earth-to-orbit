import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
            404
          </h1>
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-blue-500/20 rounded-full"></div>
            <p className="relative text-3xl font-bold text-white mb-2">Page Not Found</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xl text-slate-300 mb-8">
          Looks like this page got lost in orbit. The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-slate-400 mb-4">Need help? Try these pages:</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition">
              Dashboard
            </Link>
            <Link href="/dashboard/requests" className="text-blue-400 hover:text-blue-300 transition">
              My Requests
            </Link>
            <Link href="/dashboard/invoices" className="text-blue-400 hover:text-blue-300 transition">
              Invoices
            </Link>
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
