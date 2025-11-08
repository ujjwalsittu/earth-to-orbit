'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, CheckCircle, Clock, XCircle, Receipt, Printer, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadInvoice();
    }
  }, [params.id]);

  const loadInvoice = async () => {
    try {
      const response: any = await apiClient.get(`/api/invoices/${params.id}`);
      if (response.success) {
        setInvoice(response.data?.data?.invoice || response.data?.invoice);
      }
    } catch (error) {
      console.error('Failed to load invoice', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoice details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    toast({
      title: 'Feature Coming Soon',
      description: 'PDF download will be available soon',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailInvoice = () => {
    toast({
      title: 'Feature Coming Soon',
      description: 'Email functionality will be available soon',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-orange-100 text-orange-800 border-orange-200',
      PAID: 'bg-green-100 text-green-800 border-green-200',
      OVERDUE: 'bg-red-100 text-red-800 border-red-200',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'PAID':
        return <CheckCircle className="h-4 w-4" />;
      case 'OVERDUE':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <Receipt className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Invoice Not Found</h2>
        <p className="text-slate-600 mt-2">The invoice you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/admin/invoices')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/invoices')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Invoice Details</h1>
            <p className="text-slate-600 mt-1">Invoice #{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEmailInvoice}>
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Status Banner */}
      <Card className={`border-2 ${invoice.paymentStatus === 'PAID' ? 'border-green-200 bg-green-50' : invoice.paymentStatus === 'OVERDUE' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(invoice.paymentStatus)}
              <div>
                <p className="font-semibold text-lg">
                  {invoice.paymentStatus === 'PAID' ? 'Payment Received' : invoice.paymentStatus === 'OVERDUE' ? 'Payment Overdue' : 'Payment Pending'}
                </p>
                <p className="text-sm text-slate-600">
                  {invoice.paymentStatus === 'PAID'
                    ? `Paid on ${formatDate(invoice.paidAt)}`
                    : `Due date: ${formatDate(invoice.dueDate)}`
                  }
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(invoice.paymentStatus)} border text-base px-4 py-2`}>
              {invoice.paymentStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Invoice Card */}
        <Card className="border-slate-200 md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Invoice</CardTitle>
                <CardDescription className="mt-2">
                  <span className="font-mono text-lg font-semibold text-slate-900">
                    {invoice.invoiceNumber}
                  </span>
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Issue Date</p>
                <p className="font-semibold">{formatDate(invoice.issueDate)}</p>
                <p className="text-sm text-slate-600 mt-2">Due Date</p>
                <p className="font-semibold">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bill To */}
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2">BILL TO</p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="font-semibold text-lg">{invoice.organization?.name}</p>
                <p className="text-sm text-slate-600 mt-1">{invoice.organization?.email}</p>
                {invoice.organization?.address && (
                  <p className="text-sm text-slate-600 mt-1">{invoice.organization?.address}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Related Request */}
            {invoice.request && (
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">RELATED REQUEST</p>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono font-semibold">{invoice.request.requestNumber}</p>
                      <p className="text-sm text-slate-600 mt-1">{invoice.request.title}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/requests`)}
                    >
                      View Request
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Line Items */}
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-4">LINE ITEMS</p>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold text-right">Quantity</TableHead>
                      <TableHead className="font-semibold text-right">Rate</TableHead>
                      <TableHead className="font-semibold text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.lineItems?.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <p className="font-medium">{item.description}</p>
                          {item.details && (
                            <p className="text-sm text-slate-600">{item.details}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity || 1}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!invoice.lineItems || invoice.lineItems.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-500">
                          No line items available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal || 0)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(invoice.discount)}
                    </span>
                  </div>
                )}
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      Tax {invoice.taxRate ? `(${invoice.taxRate}%)` : ''}
                    </span>
                    <span className="font-medium">{formatCurrency(invoice.tax)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">{formatCurrency(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">NOTES</p>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-700">{invoice.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Information */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Payment Status</p>
                <Badge className={`${getStatusColor(invoice.paymentStatus)} border mt-1`}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(invoice.paymentStatus)}
                    {invoice.paymentStatus}
                  </span>
                </Badge>
              </div>

              {invoice.paymentStatus === 'PAID' && invoice.paidAt && (
                <div>
                  <p className="text-sm text-slate-600">Paid On</p>
                  <p className="font-medium">{formatDate(invoice.paidAt)}</p>
                </div>
              )}

              {invoice.paymentMethod && (
                <div>
                  <p className="text-sm text-slate-600">Payment Method</p>
                  <p className="font-medium">{invoice.paymentMethod}</p>
                </div>
              )}

              {invoice.paymentProof && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-2">Payment Proof</p>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-2">
                      {invoice.paymentProof.transactionId && (
                        <div>
                          <p className="text-xs text-slate-600">Transaction ID</p>
                          <p className="text-sm font-mono font-medium">
                            {invoice.paymentProof.transactionId}
                          </p>
                        </div>
                      )}
                      {invoice.paymentProof.submittedAt && (
                        <div>
                          <p className="text-xs text-slate-600">Submitted</p>
                          <p className="text-sm">{formatDate(invoice.paymentProof.submittedAt)}</p>
                        </div>
                      )}
                      {invoice.paymentProof.attachmentUrl && (
                        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                          <a href={invoice.paymentProof.attachmentUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            View Proof
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Amount Due</span>
                <span className="font-semibold text-lg text-blue-600">
                  {invoice.paymentStatus === 'PAID' ? formatCurrency(0) : formatCurrency(invoice.totalAmount)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Issue Date</span>
                <span className="font-medium">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Due Date</span>
                <span className="font-medium">{formatDate(invoice.dueDate)}</span>
              </div>
              {invoice.paymentStatus === 'PAID' && invoice.paidAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Paid Date</span>
                  <span className="font-medium text-green-600">{formatDate(invoice.paidAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {invoice.paymentStatus === 'PENDING' && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <p className="text-sm text-orange-800 mb-3">
                  This invoice is awaiting payment from the organization.
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/admin/payments')}>
                  View Payment Approvals
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
