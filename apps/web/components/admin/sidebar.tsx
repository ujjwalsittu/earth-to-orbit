'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Satellite,
  LayoutDashboard,
  FileCheck,
  Package,
  Users,
  CreditCard,
  Building2,
  DollarSign,
  LogOut,
  Settings,
  BarChart3,
  MapPin,
  Wrench,
  UserCog,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navSections = [
  {
    title: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Operations',
    items: [
      { href: '/admin/requests', label: 'Booking Requests', icon: FileCheck },
      { href: '/admin/invoices', label: 'Invoices', icon: Receipt },
      { href: '/admin/payments', label: 'Payment Approvals', icon: CreditCard },
    ],
  },
  {
    title: 'Catalog Management',
    items: [
      { href: '/admin/catalog/sites', label: 'Sites', icon: MapPin },
      { href: '/admin/catalog/labs', label: 'Labs & Machinery', icon: Wrench },
      { href: '/admin/catalog/components', label: 'Components', icon: Package },
      { href: '/admin/catalog/staff', label: 'Staff', icon: UserCog },
    ],
  },
  {
    title: 'Administration',
    items: [
      { href: '/admin/organizations', label: 'Organizations', icon: Building2 },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/finance', label: 'Finance', icon: DollarSign },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const getInitials = () => {
    if (!user?.firstName || !user?.lastName) return 'AD';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-slate-950 text-white border-r border-slate-800 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        {!collapsed && (
          <Link href="/admin" className="flex items-center space-x-2">
            <Satellite className="h-6 w-6 text-blue-400" />
            <span className="font-bold text-lg">E2O Admin</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/admin" className="flex items-center justify-center w-full">
            <Satellite className="h-6 w-6 text-blue-400" />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-slate-800 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-slate-300 hover:text-white hover:bg-slate-800"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>

      {/* User Profile */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 bg-blue-600">
            <AvatarFallback className="bg-blue-600 text-white font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">Platform Admin</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full mt-3 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}
