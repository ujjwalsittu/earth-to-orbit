'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, CreditCard, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { formatDate, formatCurrency } from '@/lib/utils';
import ExtensionRequestDialog from '@/components/extension-request-dialog';

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [bankTransferData, setBankTransferData] = useState({
    receiptUrl: '',
    transactionId: '',
    bankName: '',
  });

  useEffect(() => {
    loadRequest();
  }, [params.id]);

  const loadRequest = async () => {
    try {
      const response: any = await apiClient.getRequestById(params.id);
      if (response.success) {
        // API returns the request document directly in `data`
        setRequest(response.data);

        // Fetch invoice for this request (if any)
        try {
          const invoiceRes: any = await apiClient.get(`/billing/invoices/request/${params.id}`);
          if (invoiceRes.success && invoiceRes.data) {
            setInvoices([invoiceRes.data]);
          } else {
            setInvoices([]);
          }
        } catch (e) {
          // No invoice found or access denied; proceed without invoices
          setInvoices([]);
        }
      }
    } catch (error) {
      console.error('Failed to load request', error);
      toast({
        title: 'Error',
        description: 'Failed to load request details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithRazorpay = async (invoiceId: string) => {
    try {
      const response: any = await apiClient.createRazorpayOrder(invoiceId);
      if (!response.success) throw new Error('Failed to create order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: response.data.razorpayOrder.amount,
        currency: response.data.razorpayOrder.currency,
        name: 'Earth To Orbit',
        description: `Invoice ${invoices.find(i => i._id === invoiceId)?.invoiceNumber}`,
        order_id: response.data.razorpayOrder.id,
        handler: async (rzpResponse: any) => {
          try {
            await apiClient.verifyRazorpayPayment({
              razorpayOrderId: rzpResponse.razorpay_order_id,
              razorpayPaymentId: rzpResponse.razorpay_payment_id,
              razorpaySignature: rzpResponse.razorpay_signature,
            });
            toast({
              title: 'Payment successful',
              description: 'Your payment has been processed',
            });
            loadRequest();
          } catch (error) {
            toast({
              title: 'Verification failed',
              description: 'Payment received but verification failed',
              variant: 'destructive',
            });
          }
        },
        theme: {
          color: '#3b82f6',
        },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast({
        title: 'Payment failed',
        description: error?.message || 'Failed to initiate payment',
        variant: 'destructive',
      });
    }
  };

  const handleBankTransferSubmit = async (invoiceId: string) => {
    try {
      await apiClient.uploadBankTransferReceipt({
        invoiceId,
        ...bankTransferData,
      });
      toast({
        title: 'Receipt uploaded',
        description: 'Your payment receipt has been submitted for verification',
      });
      setPaymentDialogOpen(false);
      loadRequest();
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error?.message || 'Failed to upload receipt',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-200 text-gray-800',
    };
    return colors[s] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-muted-foreground mb-4">Request not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{request.requestNumber}</h1>
          <p className="text-muted-foreground">{request.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Extension request flow requires scheduling fields not present in current API; hidden for now */}
          <Badge className={getStatusColor(request.status)}>{(request.status || '').toUpperCase()}</Badge>
        </div>
      </div>

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold">Description</p>
            <p className="text-sm text-muted-foreground">{request.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Created</p>
              <p className="text-sm text-muted-foreground">
                {request.createdAt ? formatDate(request.createdAt) : '—'}
              </p>
            </div>
            {request.approvedAt && (
              <div>
                <p className="text-sm font-semibold">Approved</p>
                <p className="text-sm text-muted-foreground">{formatDate(request.approvedAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment & Labs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(request.items || [])
              .filter((item: any) => item.itemType === 'lab')
              .map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{item.item?.name || 'Lab'}</p>
                    <p className="text-sm text-muted-foreground">{item.days} day(s)</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Components */}
      {(request.items || []).some((i: any) => i.itemType === 'component') && (
        <Card>
          <CardHeader>
            <CardTitle>Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(request.items || [])
                .filter((item: any) => item.itemType === 'component')
                .map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{item.item?.name || 'Component'}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatCurrency(request.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>GST</span>
            <span>{formatCurrency(request.tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>{formatCurrency(request.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice._id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(invoice.total)} • {invoice.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const blob = await apiClient.getInvoicePDF(invoice._id);
                      const url = window.URL.createObjectURL(blob as Blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${invoice.invoiceNumber}.pdf`;
                      a.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  {invoice.status === 'PENDING' && (
                    <>
                      <Button size="sm" onClick={() => handlePayWithRazorpay(invoice._id)}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Receipt className="h-4 w-4 mr-2" />
                            Bank Transfer
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Bank Transfer</DialogTitle>
                            <DialogDescription>
                              Upload your payment receipt for verification
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Receipt URL *</Label>
                              <Input
                                placeholder="https://example.com/receipt.pdf"
                                value={bankTransferData.receiptUrl}
                                onChange={(e) =>
                                  setBankTransferData({
                                    ...bankTransferData,
                                    receiptUrl: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>Transaction ID</Label>
                              <Input
                                placeholder="TXN123456"
                                value={bankTransferData.transactionId}
                                onChange={(e) =>
                                  setBankTransferData({
                                    ...bankTransferData,
                                    transactionId: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>Bank Name</Label>
                              <Input
                                placeholder="HDFC Bank"
                                value={bankTransferData.bankName}
                                onChange={(e) =>
                                  setBankTransferData({
                                    ...bankTransferData,
                                    bankName: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <Button
                              onClick={() => handleBankTransferSubmit(invoice._id)}
                              className="w-full"
                            >
                              Submit Receipt
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
