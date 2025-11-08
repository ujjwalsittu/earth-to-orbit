'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { AdminSidebar } from '@/components/admin/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={['PLATFORM_ADMIN']}>
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-8 px-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
