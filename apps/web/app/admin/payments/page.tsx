'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function PaymentVerificationPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      const response: any = await apiClient.get('/api/payments/pending-verification');
      if (response.data.success) {
        setPayments(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load pending payments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    try {
      await apiClient.post(`/api/payments/${paymentId}/approve-bank-transfer`);
      toast({
        title: 'Payment approved',
        description: 'Bank transfer payment has been verified and approved',
      });
      loadPendingPayments();
    } catch (error: any) {
      toast({
        title: 'Approval failed',
        description: error?.message || 'Failed to approve payment',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (paymentId: string) => {
    try {
      await apiClient.post(`/api/payments/${paymentId}/reject-bank-transfer`);
      toast({
        title: 'Payment rejected',
        description: 'Bank transfer payment has been rejected',
      });
      loadPendingPayments();
    } catch (error: any) {
      toast({
        title: 'Rejection failed',
        description: error?.message || 'Failed to reject payment',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Verification</h1>
        <p className="text-muted-foreground">Review and approve bank transfer receipts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Bank Transfer Verifications</CardTitle>
          <CardDescription>
            {payments.length} payment{payments.length !== 1 ? 's' : ''} awaiting verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              ))}
            </div>
          ) : payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank Name</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="font-medium">
                      {payment.invoiceId?.invoiceNumber || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {payment.invoiceId?.organizationId?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {payment.bankTransfer?.bankName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {payment.bankTransfer?.transactionId || 'N/A'}
                      </code>
                    </TableCell>
                    <TableCell>
                      {payment.bankTransfer?.receiptUrl ? (
                        <a
                          href={payment.bankTransfer.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(payment._id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(payment._id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
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
              <Badge className="mb-4 bg-green-100 text-green-800">All Caught Up</Badge>
              <p className="text-muted-foreground">No pending payments to verify</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting your review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(payments.reduce((sum, p) => sum + (p.amount || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">Pending verification value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2-4h</div>
            <p className="text-xs text-muted-foreground">Typical review time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
