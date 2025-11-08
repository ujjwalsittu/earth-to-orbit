'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Users,
  Package,
  CreditCard,
  TrendingUp,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiClient } from '@/lib/api-client';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    totalRequests: 0,
    approvedToday: 0,
    totalOrganizations: 0,
    activeOrgs: 0,
    totalUsers: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [requestsRes, orgsRes, usersRes, invoicesRes]: any = await Promise.all([
        apiClient.get('/api/requests'),
        apiClient.getOrganizations(),
        apiClient.getUsers(),
        apiClient.get('/api/invoices'),
      ]);

      const allRequests = requestsRes?.data?.data?.requests || [];
      const pendingRequests = allRequests.filter((r: any) => r.status === 'SUBMITTED');

      // Requests approved today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const approvedToday = allRequests.filter(
        (r: any) => r.status === 'APPROVED' && new Date(r.updatedAt) >= today
      );

      const allInvoices = invoicesRes?.data?.data?.invoices || [];
      const pendingPayments = allInvoices.filter((i: any) => i.paymentStatus === 'PENDING');
      const paidInvoices = allInvoices.filter((i: any) => i.paymentStatus === 'PAID');
      const totalRevenue = paidInvoices.reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);

      // Monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = paidInvoices
        .filter((i: any) => {
          const date = new Date(i.paidAt || i.createdAt);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);

      // Revenue growth (mock calculation - would need historical data)
      const revenueGrowth = 12.5; // Mock value

      const allOrgs = orgsRes?.data?.data?.organizations || [];
      const activeOrgs = allOrgs.filter((o: any) => o.status === 'ACTIVE');

      setStats({
        pendingRequests: pendingRequests.length,
        totalRequests: allRequests.length,
        approvedToday: approvedToday.length,
        totalOrganizations: allOrgs.length,
        activeOrgs: activeOrgs.length,
        totalUsers: usersRes?.data?.data?.users?.length || 0,
        pendingPayments: pendingPayments.length,
        totalRevenue,
        monthlyRevenue,
        revenueGrowth,
      });

      setRecentRequests(allRequests.slice(0, 8));
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20 mt-2" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pending Requests</CardTitle>
                <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.pendingRequests}</div>
                <div className="flex items-center mt-2 text-xs text-slate-600">
                  <span>Awaiting your review</span>
                </div>
                <Link href="/admin/requests">
                  <Button variant="link" size="sm" className="mt-2 px-0 text-blue-600">
                    Review now →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Monthly Revenue</CardTitle>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {formatCurrency(stats.monthlyRevenue)}
                </div>
                <div className="flex items-center mt-2 text-xs">
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">{stats.revenueGrowth}%</span>
                  <span className="text-slate-600 ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pending Payments</CardTitle>
                <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.pendingPayments}</div>
                <div className="flex items-center mt-2 text-xs text-slate-600">
                  <span>Awaiting confirmation</span>
                </div>
                <Link href="/admin/payments">
                  <Button variant="link" size="sm" className="mt-2 px-0 text-blue-600">
                    View payments →
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Active Organizations</CardTitle>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.activeOrgs}</div>
                <div className="flex items-center mt-2 text-xs text-slate-600">
                  <span>{stats.totalOrganizations} total organizations</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">Today's Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Requests Approved</span>
              <span className="text-2xl font-bold text-green-600">{stats.approvedToday}</span>
            </div>
            <Progress value={(stats.approvedToday / Math.max(stats.pendingRequests, 1)) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-sm text-slate-600 mt-2">All-time collected</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900">Platform Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.totalUsers}</div>
            <p className="text-sm text-slate-600 mt-2">Across {stats.totalOrganizations} organizations</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests Table */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-900">Recent Booking Requests</CardTitle>
            <CardDescription className="text-slate-600">Latest submissions requiring your attention</CardDescription>
          </div>
          <Link href="/admin/requests">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : recentRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.map((request) => (
                  <TableRow key={request._id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{request.requestNumber}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell className="text-slate-600">
                      {request.organization?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-600">{formatDate(request.createdAt)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(request.status)}
                          {request.status}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/requests/${request._id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-slate-600 py-8">No recent requests</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/catalog/sites">
          <Card className="border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Manage Sites</p>
                  <p className="text-sm text-slate-600">Add & edit locations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/catalog/labs">
          <Card className="border-slate-200 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Manage Labs</p>
                  <p className="text-sm text-slate-600">Configure machinery</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/catalog/components">
          <Card className="border-slate-200 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Manage Components</p>
                  <p className="text-sm text-slate-600">Add inventory items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/organizations">
          <Card className="border-slate-200 hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Organizations</p>
                  <p className="text-sm text-slate-600">Manage clients</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
