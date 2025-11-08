'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, CheckCircle, XCircle, Clock, Package, Wrench, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { formatDate, formatCurrency } from '@/lib/utils';
import { RequestApprovalDialog } from '@/components/admin/request-approval-dialog';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadRequest();
    }
  }, [params.id]);

  const loadRequest = async () => {
    try {
      const response: any = await apiClient.get(`/api/requests/${params.id}`);
      if (response.success) {
        setRequest(response.data?.data?.request || response.data?.request);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
      SUBMITTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800 border-blue-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      SCHEDULED: 'bg-purple-100 text-purple-800 border-purple-200',
      IN_PROGRESS: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      COMPLETED: 'bg-teal-100 text-teal-800 border-teal-200',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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

  if (!request) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Request Not Found</h2>
        <p className="text-slate-600 mt-2">The request you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/admin/requests')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requests
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/requests')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Request Details</h1>
            <p className="text-slate-600 mt-1">Request #{request.requestNumber}</p>
          </div>
        </div>
        {request.status === 'SUBMITTED' && (
          <RequestApprovalDialog request={request} onSuccess={loadRequest} />
        )}
      </div>

      {/* Status Banner */}
      <Card className={`border-2 ${request.status === 'APPROVED' ? 'border-green-200 bg-green-50' : request.status === 'REJECTED' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(request.status)}
              <div>
                <p className="font-semibold text-lg">
                  {request.status === 'APPROVED' ? 'Request Approved' : request.status === 'REJECTED' ? 'Request Rejected' : 'Pending Review'}
                </p>
                <p className="text-sm text-slate-600">
                  {request.status === 'APPROVED' && request.approvedAt
                    ? `Approved on ${formatDate(request.approvedAt)}`
                    : request.status === 'SUBMITTED'
                    ? `Submitted on ${formatDate(request.submittedAt)}`
                    : `Created on ${formatDate(request.createdAt)}`
                  }
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(request.status)} border text-base px-4 py-2`}>
              {request.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Request Card */}
        <Card className="border-slate-200 md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Booking Request</CardTitle>
                <CardDescription className="mt-2">
                  <span className="font-mono text-lg font-semibold text-slate-900">
                    {request.requestNumber}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Request Info */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-slate-600">Title</Label>
                <p className="font-semibold text-lg mt-1">{request.title}</p>
              </div>

              {request.description && (
                <div>
                  <Label className="text-sm text-slate-600">Description</Label>
                  <p className="text-sm text-slate-700 mt-1">{request.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-slate-600">Organization</Label>
                  <p className="font-medium mt-1">{request.organization?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-600">Requested By</Label>
                  <p className="font-medium mt-1">
                    {request.requestedBy?.firstName} {request.requestedBy?.lastName}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Machinery Items */}
            {request.machineryItems && request.machineryItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-semibold">Labs & Machinery ({request.machineryItems.length})</Label>
                </div>
                <div className="space-y-3">
                  {request.machineryItems.map((item: any, idx: number) => (
                    <Card key={idx} className="border-slate-200 bg-slate-50">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <p className="font-semibold">{item.lab?.name || 'N/A'}</p>
                            <div className="space-y-1 text-sm text-slate-600">
                              <p>Site: {item.site?.name || 'N/A'}</p>
                              {item.startTime && item.endTime && (
                                <p className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(item.startTime)} → {formatDate(item.endTime)}
                                </p>
                              )}
                              {item.durationHours && (
                                <p>Duration: {item.durationHours} hours</p>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-sm text-slate-600 italic">Note: {item.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-blue-600">
                              {formatCurrency(item.subtotal || 0)}
                            </p>
                            {item.rateSnapshot && (
                              <p className="text-xs text-slate-500">
                                {formatCurrency(item.rateSnapshot)}/hr
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Component Items */}
            {request.components && request.components.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-purple-600" />
                    <Label className="text-base font-semibold">Components ({request.components.length})</Label>
                  </div>
                  <div className="space-y-3">
                    {request.components.map((item: any, idx: number) => (
                      <Card key={idx} className="border-slate-200 bg-slate-50">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <p className="font-semibold">{item.component?.name || 'N/A'}</p>
                              <div className="space-y-1 text-sm text-slate-600">
                                <p>SKU: {item.component?.sku}</p>
                                <p>Quantity: {item.quantity}</p>
                                {item.rentalDays && (
                                  <p>Rental Duration: {item.rentalDays} days</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-purple-600">
                                {formatCurrency(item.subtotal || 0)}
                              </p>
                              {item.priceSnapshot && (
                                <p className="text-xs text-slate-500">
                                  {formatCurrency(item.priceSnapshot)}/unit
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Assistance Items */}
            {request.assistanceItems && request.assistanceItems.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-green-600" />
                    <Label className="text-base font-semibold">Staff Assistance ({request.assistanceItems.length})</Label>
                  </div>
                  <div className="space-y-3">
                    {request.assistanceItems.map((item: any, idx: number) => (
                      <Card key={idx} className="border-slate-200 bg-slate-50">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <p className="font-semibold">
                                {item.staff
                                  ? `${item.staff.firstName} ${item.staff.lastName}`
                                  : 'General Assistance'
                                }
                              </p>
                              <div className="space-y-1 text-sm text-slate-600">
                                {item.staff?.designation && (
                                  <p>Designation: {item.staff.designation}</p>
                                )}
                                {item.hours && <p>Hours: {item.hours}</p>}
                              </div>
                              {item.notes && (
                                <p className="text-sm text-slate-600 italic">Note: {item.notes}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-green-600">
                                {formatCurrency(item.subtotal || 0)}
                              </p>
                              {item.rateSnapshot && (
                                <p className="text-xs text-slate-500">
                                  {formatCurrency(item.rateSnapshot)}/hr
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Total */}
            <Separator />
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(request.totals?.subtotal || 0)}</span>
                </div>
                {request.totals?.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-medium">{formatCurrency(request.totals.tax)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">{formatCurrency(request.totals?.total || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Information */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Status Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Current Status</p>
                <Badge className={`${getStatusColor(request.status)} border mt-1`}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(request.status)}
                    {request.status}
                  </span>
                </Badge>
              </div>

              {request.approvedBy && (
                <div>
                  <p className="text-sm text-slate-600">Approved By</p>
                  <p className="font-medium">Admin</p>
                  <p className="text-xs text-slate-500">{formatDate(request.approvedAt)}</p>
                </div>
              )}

              {request.rejectionReason && (
                <div>
                  <p className="text-sm text-slate-600">Rejection Reason</p>
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded mt-1">
                    {request.rejectionReason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Created</span>
                <span className="font-medium">{formatDate(request.createdAt)}</span>
              </div>
              {request.submittedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Submitted</span>
                  <span className="font-medium">{formatDate(request.submittedAt)}</span>
                </div>
              )}
              {request.approvedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Approved</span>
                  <span className="font-medium text-green-600">{formatDate(request.approvedAt)}</span>
                </div>
              )}
              {request.updatedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Last Updated</span>
                  <span className="font-medium">{formatDate(request.updatedAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {request.status === 'SUBMITTED' && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <p className="text-sm text-yellow-800 mb-3">
                  This request is awaiting your review and approval.
                </p>
                <RequestApprovalDialog request={request} onSuccess={loadRequest}>
                  <Button variant="default" size="sm" className="w-full">
                    Review Request
                  </Button>
                </RequestApprovalDialog>
              </CardContent>
            </Card>
          )}

          {request.status === 'APPROVED' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <p className="text-sm text-green-800 mb-3">
                  Request approved. Invoice generated automatically.
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/admin/invoices')}>
                  View Invoices
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
