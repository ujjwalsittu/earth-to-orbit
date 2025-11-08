'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Receipt, Search, Download, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { toast } = useToast();

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchQuery, statusFilter]);

  const loadInvoices = async () => {
    try {
      const response: any = await apiClient.get('/api/invoices');
      if (response.success) {
        const allInvoices = response.data?.data?.invoices || [];
        setInvoices(allInvoices);
      }
    } catch (error) {
      console.error('Failed to load invoices', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Filter by payment status
    if (statusFilter && statusFilter !== 'ALL') {
      filtered = filtered.filter((i) => i.paymentStatus === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.invoiceNumber?.toLowerCase().includes(query) ||
          i.organization?.name?.toLowerCase().includes(query) ||
          i.request?.requestNumber?.toLowerCase().includes(query)
      );
    }

    setFilteredInvoices(filtered);
  };

  const getStatusCounts = () => {
    const paid = invoices.filter((i) => i.paymentStatus === 'PAID');
    const pending = invoices.filter((i) => i.paymentStatus === 'PENDING');
    const overdue = invoices.filter((i) => i.paymentStatus === 'OVERDUE');

    return {
      total: invoices.length,
      paid: paid.length,
      pending: pending.length,
      overdue: overdue.length,
      totalRevenue: paid.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
      pendingAmount: pending.reduce((sum, i) => sum + (i.totalAmount || 0), 0),
    };
  };

  const counts = getStatusCounts();

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
        return <Clock className="h-3 w-3" />;
      case 'PAID':
        return <CheckCircle className="h-3 w-3" />;
      case 'OVERDUE':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Receipt className="h-3 w-3" />;
    }
  };

  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      toast({
        title: 'Downloading Invoice',
        description: `Generating PDF for ${invoiceNumber}...`,
      });

      // TODO: Implement PDF download
      // const response = await apiClient.get(`/api/invoices/${invoiceId}/download`);

      toast({
        title: 'Feature Coming Soon',
        description: 'PDF download will be available soon',
      });
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error?.message || 'Failed to download invoice',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Invoices</h1>
        <p className="text-slate-600 mt-2">Manage and track all invoices</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-slate-200 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Invoices</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{counts.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Paid</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{counts.paid}</p>
                <p className="text-xs text-slate-500 mt-1">{formatCurrency(counts.totalRevenue)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{counts.pending}</p>
                <p className="text-xs text-slate-500 mt-1">{formatCurrency(counts.pendingAmount)}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{counts.overdue}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>View and manage invoice records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by invoice number, organization, or request..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredInvoices.length > 0 ? (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Invoice #</TableHead>
                    <TableHead className="font-semibold">Request #</TableHead>
                    <TableHead className="font-semibold">Organization</TableHead>
                    <TableHead className="font-semibold">Issue Date</TableHead>
                    <TableHead className="font-semibold">Due Date</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice._id} className="hover:bg-slate-50">
                      <TableCell className="font-mono font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="font-mono">
                        {invoice.request?.requestNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {invoice.organization?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-600">{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell className="text-slate-600">{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        {formatCurrency(invoice.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(invoice.paymentStatus)} border`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(invoice.paymentStatus)}
                            {invoice.paymentStatus}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadInvoice(invoice._id, invoice.invoiceNumber)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Link href={`/admin/invoices/${invoice._id}`}>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <Receipt className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No invoices found</p>
              <p className="text-slate-500 text-sm mt-1">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Invoices will appear here when requests are approved'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
