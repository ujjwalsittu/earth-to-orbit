'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, statusFilter]);

  const loadRequests = async () => {
    try {
      const response: any = await apiClient.getRequests();
      if (response.success) {
        setRequests(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load requests', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.requestNumber?.toLowerCase().includes(query) ||
          req.title?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      SCHEDULED: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      PAID: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Requests</h1>
          <p className="text-muted-foreground">Manage your lab and machinery bookings</p>
        </div>
        <Link href="/dashboard/requests/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by request number or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(searchQuery || statusFilter !== 'ALL') && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredRequests.length} of {requests.length} requests
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>View and track all your booking requests</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Request #</TableHead>
                    <TableHead className="whitespace-nowrap">Title</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap">Total</TableHead>
                    <TableHead className="whitespace-nowrap">Created</TableHead>
                    <TableHead className="whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell className="font-medium whitespace-nowrap">{request.requestNumber}</TableCell>
                      <TableCell className="min-w-[200px]">{request.title}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{formatCurrency(request.totals?.total || 0)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(request.createdAt)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Link href={`/dashboard/requests/${request._id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No requests yet</p>
              <Link href="/dashboard/requests/new">
                <Button>Create Your First Request</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
