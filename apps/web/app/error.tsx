'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { config } from '@/lib/config';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-red-900 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4 rounded-full bg-red-500/20 border-2 border-red-500">
            <AlertTriangle className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Something Went Wrong</h1>
          <p className="text-lg text-slate-300">
            We encountered an unexpected error. Don't worry, our team has been notified.
          </p>
        </div>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-8 p-4 bg-red-950/50 border border-red-500/50 rounded-lg text-left">
            <p className="text-sm font-mono text-red-200 break-all">{error.message}</p>
            {error.digest && (
              <p className="text-xs text-red-300 mt-2">Error ID: {error.digest}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => reset()}
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          <Link href="/">
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-slate-400">
            If this problem persists, please contact our support team at{' '}
            <a href={`mailto:${config.company.supportEmail}`} className="text-blue-400 hover:text-blue-300">
              {config.company.supportEmail}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
