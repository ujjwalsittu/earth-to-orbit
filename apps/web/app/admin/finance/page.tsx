'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  FileText,
  CreditCard,
  Download,
  Eye,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api-client';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function AdminFinancePage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [invoiceDetailsOpen, setInvoiceDetailsOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all');

  useEffect(() => {
    loadFinanceData();
  }, [filterPeriod]);

  const loadFinanceData = async () => {
    try {
      const [invoicesRes, paymentsRes, statsRes]: any = await Promise.all([
        apiClient.get(`/api/admin/invoices?period=${filterPeriod}`),
        apiClient.get(`/api/admin/payments?period=${filterPeriod}`),
        apiClient.get(`/api/admin/finance/stats?period=${filterPeriod}`),
      ]);

      if (invoicesRes.success) {
        setInvoices(invoicesRes.data.invoices || []);
      }
      if (paymentsRes.success) {
        setPayments(paymentsRes.data.payments || []);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Failed to load finance data', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoiceDetails = async (invoiceId: string) => {
    try {
      const response: any = await apiClient.get(`/api/admin/invoices/${invoiceId}`);
      if (response.success) {
        setSelectedInvoice(response.data.invoice);
        setInvoiceDetailsOpen(true);
      }
    } catch (error) {
      console.error('Failed to load invoice details', error);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PAID: 'default',
      PENDING: 'secondary',
      FAILED: 'destructive',
      REFUNDED: 'outline',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Finance & Billing</h1>
          <p className="text-muted-foreground">View revenue, invoices, and payment analytics</p>
        </div>
        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.revenueGrowth > 0 ? '+' : ''}
              {stats.revenueGrowth?.toFixed(1)}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.paidAmount || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.paidAmount / stats.totalRevenue) * 100 || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.pendingAmount || 0)}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingInvoices || 0} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices || 0}</div>
            <p className="text-xs text-muted-foreground">{stats.totalPayments || 0} payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      {stats.revenueByCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Breakdown of revenue sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.revenueByCategory).map(([category, amount]: [string, any]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <p className="font-medium capitalize">{category.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {((amount / stats.totalRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>List of all generated invoices</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Request #</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.organizationId?.name}</TableCell>
                    <TableCell className="font-mono">{invoice.requestId?.requestNumber}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>{getPaymentStatusBadge(invoice.paymentStatus)}</TableCell>
                    <TableCell>
                      {invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => loadInvoiceDetails(invoice._id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No invoices found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Payment transactions and history</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="font-mono text-xs">
                      {payment.transactionId || payment._id}
                    </TableCell>
                    <TableCell className="font-mono">
                      {payment.invoiceId?.invoiceNumber}
                    </TableCell>
                    <TableCell>{payment.organizationId?.name}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                    <TableCell>{formatDate(payment.paidAt || payment.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No payments found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      <Dialog open={invoiceDetailsOpen} onOpenChange={setInvoiceDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              {selectedInvoice && `Invoice #${selectedInvoice.invoiceNumber}`}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Header */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Organization</p>
                  <p className="font-medium">{selectedInvoice.organizationId?.name}</p>
                  <p className="text-sm">{selectedInvoice.organizationId?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <p className="font-medium">{formatDate(selectedInvoice.issuedAt)}</p>
                  {selectedInvoice.dueDate && (
                    <>
                      <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                      <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Request Reference */}
              <div>
                <p className="text-sm text-muted-foreground">Request Reference</p>
                <p className="font-medium">
                  {selectedInvoice.requestId?.requestNumber} - {selectedInvoice.requestId?.title}
                </p>
              </div>

              <Separator />

              {/* Line Items */}
              <div>
                <h4 className="font-semibold mb-3">Invoice Items</h4>
                <div className="space-y-2">
                  {selectedInvoice.lineItems?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-start border rounded-lg p-3">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Subtotal</p>
                  <p className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</p>
                </div>
                {selectedInvoice.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Tax ({selectedInvoice.taxRate}%)</p>
                    <p className="font-medium">{formatCurrency(selectedInvoice.taxAmount)}</p>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg">
                  <p className="font-semibold">Total Amount</p>
                  <p className="font-bold">{formatCurrency(selectedInvoice.totalAmount)}</p>
                </div>
              </div>

              {selectedInvoice.paidAmount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-900">Paid Amount</p>
                      <p className="text-sm text-green-700">
                        {selectedInvoice.paidAt && formatDate(selectedInvoice.paidAt)}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-900">
                      {formatCurrency(selectedInvoice.paidAmount)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                {getPaymentStatusBadge(selectedInvoice.paymentStatus)}
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
