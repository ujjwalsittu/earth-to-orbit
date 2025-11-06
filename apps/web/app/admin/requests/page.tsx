'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response: any = await apiClient.getPendingRequests();
      if (response.success) {
        setRequests(response.data.requests || []);
      }
    } catch (error) {
      console.error('Failed to load requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const response: any = await apiClient.approveRequest(requestId, {
        scheduledStart: new Date().toISOString(),
        scheduledEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      if (response.success) {
        toast({
          title: 'Request approved',
          description: 'Invoice has been generated and customer notified',
        });
        loadRequests();
      }
    } catch (error: any) {
      toast({
        title: 'Approval failed',
        description: error?.message || 'Failed to approve request',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Requests</h1>
        <p className="text-muted-foreground">Review and approve booking requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requests Awaiting Approval</CardTitle>
          <CardDescription>
            Review machinery, components, and assistance requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request #</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell className="font-medium">{request.requestNumber}</TableCell>
                    <TableCell>{request.organizationId?.name}</TableCell>
                    <TableCell>{request.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.status}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(request.totals?.total || 0)}</TableCell>
                    <TableCell>{formatDate(request.submittedAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(request._id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pending requests</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
