'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building, Users, FileText, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function OrganizationPage() {
  const { user } = useAuthStore();
  const [organization, setOrganization] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Only allow ORG_ADMIN to access
  if (user?.role !== 'ORG_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only organization administrators can access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadOrganizationData();
  }, []);

  const loadOrganizationData = async () => {
    try {
      if (!user?.organizationId) return;

      const [orgRes, statsRes]: any = await Promise.all([
        apiClient.get(`/api/organizations/${user.organizationId}`),
        apiClient.get(`/api/organizations/${user.organizationId}/stats`),
      ]);

      if (orgRes.success) {
        setOrganization(orgRes.data);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Failed to load organization data', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization</h1>
          <p className="text-muted-foreground">Manage your organization settings and team</p>
        </div>
        <Link href="/dashboard/team">
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Manage Team
          </Button>
        </Link>
      </div>

      {/* Organization Details */}
      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {organization?.name}
              </CardTitle>
              {organization?.isVerified && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <CardDescription>{organization?.legalName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="text-sm capitalize">{organization?.type?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">GST</p>
                <p className="text-sm">{organization?.gst || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{organization?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-sm">{organization?.phone}</p>
              </div>
            </div>

            {organization?.address && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
                <p className="text-sm">
                  {organization.address.street}, {organization.address.city}
                  <br />
                  {organization.address.state}, {organization.address.country} -{' '}
                  {organization.address.postalCode}
                </p>
              </div>
            )}

            {organization?.website && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Website</p>
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {organization.website}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.members?.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Active users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.requests?.total || 0}</div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-yellow-600">
                    {stats?.requests?.pending || 0} pending
                  </span>
                  <span className="text-green-600">
                    {stats?.requests?.approved || 0} approved
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.financial?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Completed payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.financial?.pendingPayments || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Request Breakdown */}
      {!loading && stats && (
        <Card>
          <CardHeader>
            <CardTitle>Request Status Breakdown</CardTitle>
            <CardDescription>Overview of your organization's booking requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Pending Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.requests.pending}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({((stats.requests.pending / stats.requests.total) * 100 || 0).toFixed(0)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.requests.approved}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({((stats.requests.approved / stats.requests.total) * 100 || 0).toFixed(0)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Rejected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.requests.rejected}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({((stats.requests.rejected / stats.requests.total) * 100 || 0).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link href="/dashboard/team">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Team
            </Button>
          </Link>
          <Link href="/dashboard/requests">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View All Requests
            </Button>
          </Link>
          <Link href="/dashboard/invoices">
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Invoices
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
