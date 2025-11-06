'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { AdminNav } from '@/components/admin/nav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={['PLATFORM_ADMIN']}>
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container mx-auto py-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
