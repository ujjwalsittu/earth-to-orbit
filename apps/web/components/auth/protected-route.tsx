'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requiredRole && user && !requiredRole.includes(user.role)) {
      router.push('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, user, requiredRole, router]);

  if (!hasHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
