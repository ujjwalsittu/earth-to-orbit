'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Users, FileText, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [analytics, setAnalytics] = useState({
    revenue: {
      current: 0,
      previous: 0,
      growth: 0,
    },
    requests: {
      total: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
      approvalRate: 0,
    },
    organizations: {
      total: 0,
      active: 0,
      newThisMonth: 0,
    },
    topOrganizations: [] as any[],
    recentActivity: [] as any[],
    monthlyTrends: [] as any[],
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [requestsRes, orgsRes, invoicesRes]: any = await Promise.all([
        apiClient.get('/api/requests'),
        apiClient.getOrganizations(),
        apiClient.get('/api/invoices'),
      ]);

      const allRequests = requestsRes?.data?.data?.requests || [];
      const allOrgs = orgsRes?.data?.data?.organizations || [];
      const allInvoices = invoicesRes?.data?.data?.invoices || [];

      // Calculate date range
      const daysAgo = parseInt(timeRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

      // Filter data by time range
      const recentRequests = allRequests.filter(
        (r: any) => new Date(r.createdAt) >= cutoffDate
      );
      const recentInvoices = allInvoices.filter(
        (i: any) => i.paymentStatus === 'PAID' && new Date(i.paidAt || i.createdAt) >= cutoffDate
      );

      // Calculate revenue
      const currentRevenue = recentInvoices.reduce(
        (sum: number, i: any) => sum + (i.totalAmount || 0),
        0
      );

      // Previous period revenue for comparison
      const previousCutoff = new Date();
      previousCutoff.setDate(previousCutoff.getDate() - daysAgo * 2);
      const previousInvoices = allInvoices.filter(
        (i: any) =>
          i.paymentStatus === 'PAID' &&
          new Date(i.paidAt || i.createdAt) >= previousCutoff &&
          new Date(i.paidAt || i.createdAt) < cutoffDate
      );
      const previousRevenue = previousInvoices.reduce(
        (sum: number, i: any) => sum + (i.totalAmount || 0),
        0
      );

      const revenueGrowth = previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

      // Request statistics
      const approved = recentRequests.filter((r: any) => r.status === 'APPROVED').length;
      const rejected = recentRequests.filter((r: any) => r.status === 'REJECTED').length;
      const pending = recentRequests.filter((r: any) => r.status === 'SUBMITTED').length;
      const approvalRate = (approved + rejected) > 0
        ? (approved / (approved + rejected)) * 100
        : 0;

      // Organization statistics
      const activeOrgs = allOrgs.filter((o: any) => o.status === 'ACTIVE').length;
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newOrgs = allOrgs.filter(
        (o: any) => new Date(o.createdAt) >= thisMonth
      ).length;

      // Top organizations by revenue
      const orgRevenue = new Map();
      allInvoices
        .filter((i: any) => i.paymentStatus === 'PAID')
        .forEach((i: any) => {
          const orgId = i.organization?._id || i.organization;
          const orgName = i.organization?.name || 'Unknown';
          const current = orgRevenue.get(orgId) || { name: orgName, revenue: 0, requests: 0 };
          orgRevenue.set(orgId, {
            name: orgName,
            revenue: current.revenue + (i.totalAmount || 0),
            requests: current.requests + 1,
          });
        });

      const topOrgs = Array.from(orgRevenue.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Monthly trends (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthRequests = allRequests.filter((r: any) => {
          const date = new Date(r.createdAt);
          return date >= monthStart && date < monthEnd;
        });

        const monthInvoices = allInvoices.filter((i: any) => {
          if (i.paymentStatus !== 'PAID') return false;
          const date = new Date(i.paidAt || i.createdAt);
          return date >= monthStart && date < monthEnd;
        });

        const monthRevenue = monthInvoices.reduce(
          (sum: number, i: any) => sum + (i.totalAmount || 0),
          0
        );

        monthlyData.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          requests: monthRequests.length,
        });
      }

      setAnalytics({
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          growth: revenueGrowth,
        },
        requests: {
          total: recentRequests.length,
          approved,
          rejected,
          pending,
          approvalRate,
        },
        organizations: {
          total: allOrgs.length,
          active: activeOrgs,
          newThisMonth: newOrgs,
        },
        topOrganizations: topOrgs,
        recentActivity: allRequests.slice(0, 10),
        monthlyTrends: monthlyData,
      });
    } catch (error) {
      console.error('Failed to load analytics', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600 mt-2">Platform performance and insights</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-slate-200">
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge
                    className={
                      analytics.revenue.growth >= 0
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }
                  >
                    {analytics.revenue.growth >= 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(analytics.revenue.growth).toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-sm font-medium text-slate-600">Revenue</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {formatCurrency(analytics.revenue.current)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  vs {formatCurrency(analytics.revenue.previous)} previous period
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {analytics.requests.approvalRate.toFixed(0)}% approved
                  </Badge>
                </div>
                <p className="text-sm font-medium text-slate-600">Total Requests</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {analytics.requests.total}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {analytics.requests.approved} approved, {analytics.requests.rejected} rejected
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    +{analytics.organizations.newThisMonth} this month
                  </Badge>
                </div>
                <p className="text-sm font-medium text-slate-600">Organizations</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {analytics.organizations.total}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {analytics.organizations.active} active organizations
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                    {analytics.requests.pending} pending
                  </Badge>
                </div>
                <p className="text-sm font-medium text-slate-600">Approval Rate</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {analytics.requests.approvalRate.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Based on {analytics.requests.approved + analytics.requests.rejected} decisions
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trends */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Revenue and requests over last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="space-y-4">
                {analytics.monthlyTrends.map((month, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-24">
                        <p className="text-sm font-medium text-slate-900">{month.month}</p>
                      </div>
                      <div className="flex-1">
                        <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-lg"
                            style={{
                              width: `${
                                Math.max(...analytics.monthlyTrends.map((m) => m.revenue)) > 0
                                  ? (month.revenue /
                                      Math.max(...analytics.monthlyTrends.map((m) => m.revenue))) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(month.revenue)}
                      </p>
                      <p className="text-xs text-slate-500">{month.requests} requests</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Organizations */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Top Organizations</CardTitle>
            <CardDescription>By total revenue generated</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : analytics.topOrganizations.length > 0 ? (
              <div className="space-y-4">
                {analytics.topOrganizations.map((org, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{org.name}</p>
                        <p className="text-xs text-slate-500">{org.requests} requests</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{formatCurrency(org.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request Breakdown */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Request Status Breakdown</CardTitle>
          <CardDescription>Distribution of booking requests in selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{analytics.requests.pending}</p>
                <p className="text-xs text-yellow-700 mt-1">
                  {analytics.requests.total > 0
                    ? ((analytics.requests.pending / analytics.requests.total) * 100).toFixed(0)
                    : 0}
                  % of total
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-800">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{analytics.requests.approved}</p>
                <p className="text-xs text-green-700 mt-1">
                  {analytics.requests.total > 0
                    ? ((analytics.requests.approved / analytics.requests.total) * 100).toFixed(0)
                    : 0}
                  % of total
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-800">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{analytics.requests.rejected}</p>
                <p className="text-xs text-red-700 mt-1">
                  {analytics.requests.total > 0
                    ? ((analytics.requests.rejected / analytics.requests.total) * 100).toFixed(0)
                    : 0}
                  % of total
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">Total</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.requests.total}</p>
                <p className="text-xs text-blue-700 mt-1">All requests</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
