'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Satellite,
  LayoutDashboard,
  FileCheck,
  Package,
  Users,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/requests', label: 'Requests', icon: FileCheck },
  { href: '/admin/catalog', label: 'Catalog', icon: Package },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="border-b bg-slate-950 text-white">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/admin" className="flex items-center space-x-2">
          <Satellite className="h-6 w-6 text-blue-400" />
          <span className="font-bold">E2O Admin</span>
        </Link>
        <nav className="flex items-center space-x-6 mx-6 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-blue-400',
                  pathname === item.href
                    ? 'text-blue-400'
                    : 'text-gray-300'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center space-x-4">
          <div className="hidden md:block text-sm">
            <p className="font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-400">Platform Admin</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
