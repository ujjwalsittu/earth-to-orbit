'use client';

import { useState, useEffect } from 'react';
import { Check, X, Calendar, Clock, Package, Users, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';

interface RequestApprovalDialogProps {
  request: any;
  onSuccess?: () => void;
}

export function RequestApprovalDialog({ request, onSuccess }: RequestApprovalDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'view' | 'approve' | 'reject'>('view');
  const [loading, setLoading] = useState(false);
  const [labs, setLabs] = useState<any[]>([]);
  const { toast } = useToast();

  const [approvalData, setApprovalData] = useState({
    scheduledStart: '',
    scheduledEnd: '',
    labAssignments: {} as Record<string, string>, // machineryItemId -> labId
  });

  const [rejectionData, setRejectionData] = useState({
    reason: '',
  });

  useEffect(() => {
    if (open && mode === 'approve') {
      loadLabs();
      // Initialize with default dates
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      setApprovalData({
        scheduledStart: now.toISOString().slice(0, 16),
        scheduledEnd: tomorrow.toISOString().slice(0, 16),
        labAssignments: {},
      });
    }
  }, [open, mode]);

  const loadLabs = async () => {
    try {
      const response: any = await apiClient.getLabs();
      if (response.success) {
        setLabs(response.data.labs || []);
      }
    } catch (error) {
      console.error('Failed to load labs', error);
    }
  };

  const handleApprove = async () => {
    // Validate that all machinery items have labs assigned
    const unassignedItems = (request.machineryItems || []).filter(
      (item: any) => !approvalData.labAssignments[item._id]
    );

    if (unassignedItems.length > 0) {
      toast({
        title: 'Missing Lab Assignments',
        description: `Please assign labs to all ${unassignedItems.length} machinery items`,
        variant: 'destructive',
      });
      return;
    }

    if (!approvalData.scheduledStart || !approvalData.scheduledEnd) {
      toast({
        title: 'Missing Schedule',
        description: 'Please set both start and end times',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(approvalData.scheduledStart) >= new Date(approvalData.scheduledEnd)) {
      toast({
        title: 'Invalid Schedule',
        description: 'End time must be after start time',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response: any = await apiClient.approveRequest(request._id, {
        scheduledStart: new Date(approvalData.scheduledStart).toISOString(),
        scheduledEnd: new Date(approvalData.scheduledEnd).toISOString(),
        labAssignments: approvalData.labAssignments,
      });

      if (response.success) {
        toast({
          title: 'Request Approved',
          description: 'Invoice generated and customer notified',
        });
        setOpen(false);
        setMode('view');
        onSuccess?.();
      } else {
        toast({
          title: 'Approval Failed',
          description: response.message || 'Failed to approve request',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionData.reason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response: any = await apiClient.rejectRequest(request._id, rejectionData);

      if (response.success) {
        toast({
          title: 'Request Rejected',
          description: 'Customer has been notified',
        });
        setOpen(false);
        setMode('view');
        onSuccess?.();
      } else {
        toast({
          title: 'Rejection Failed',
          description: response.message || 'Failed to reject request',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderViewMode = () => (
    <>
      <div className="space-y-4">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Request Number</Label>
            <p className="font-mono font-semibold">{request.requestNumber}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Organization</Label>
            <p className="font-medium">{request.organizationId?.name}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Submitted By</Label>
            <p>
              {request.requestedBy?.firstName} {request.requestedBy?.lastName}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Submitted On</Label>
            <p>{formatDate(request.submittedAt)}</p>
          </div>
        </div>

        <Separator />

        {/* Title & Description */}
        <div>
          <Label className="text-muted-foreground">Title</Label>
          <p className="font-medium text-lg">{request.title}</p>
        </div>
        {request.description && (
          <div>
            <Label className="text-muted-foreground">Description</Label>
            <p className="text-sm">{request.description}</p>
          </div>
        )}

        <Separator />

        {/* Machinery Items */}
        {request.machineryItems && request.machineryItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="h-4 w-4" />
              <Label className="text-base">Machinery & Labs ({request.machineryItems.length})</Label>
            </div>
            <div className="space-y-2">
              {request.machineryItems.map((item: any) => (
                <div key={item._id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.machinery?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Category: {item.machinery?.category?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Site: {item.machinery?.siteId?.name}
                      </p>
                      {item.durationHours && (
                        <p className="text-sm text-muted-foreground">
                          Duration: {item.durationHours} hours
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.totalCost)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.machinery?.ratePerHour)}/hour
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Components */}
        {request.componentItems && request.componentItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4" />
              <Label className="text-base">Components ({request.componentItems.length})</Label>
            </div>
            <div className="space-y-2">
              {request.componentItems.map((item: any) => (
                <div key={item._id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.component?.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.component?.sku}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.totalCost)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.component?.pricePerUnit)} each
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assistance */}
        {request.assistanceItems && request.assistanceItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" />
              <Label className="text-base">Assistance ({request.assistanceItems.length})</Label>
            </div>
            <div className="space-y-2">
              {request.assistanceItems.map((item: any) => (
                <div key={item._id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {item.staff?.firstName} {item.staff?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.staff?.designation || 'Staff Member'}
                      </p>
                      {item.hours && <p className="text-sm text-muted-foreground">Hours: {item.hours}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.totalCost)}</p>
                      {item.staff?.ratePerHour && (
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.staff.ratePerHour)}/hour
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount</span>
            <span>{formatCurrency(request.totals?.total || 0)}</span>
          </div>
          {request.totals?.tax > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              (Subtotal: {formatCurrency(request.totals.subtotal)}, Tax:{' '}
              {formatCurrency(request.totals.tax)})
            </p>
          )}
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={() => setOpen(false)}>
          Close
        </Button>
        <Button variant="destructive" onClick={() => setMode('reject')}>
          <X className="h-4 w-4 mr-2" />
          Reject
        </Button>
        <Button onClick={() => setMode('approve')}>
          <Check className="h-4 w-4 mr-2" />
          Approve
        </Button>
      </DialogFooter>
    </>
  );

  const renderApproveMode = () => (
    <>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Schedule */}
        <div>
          <Label className="text-base mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Start Date & Time *</Label>
              <Input
                id="start"
                type="datetime-local"
                value={approvalData.scheduledStart}
                onChange={(e) => setApprovalData({ ...approvalData, scheduledStart: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Date & Time *</Label>
              <Input
                id="end"
                type="datetime-local"
                value={approvalData.scheduledEnd}
                onChange={(e) => setApprovalData({ ...approvalData, scheduledEnd: e.target.value })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Lab Assignments */}
        {request.machineryItems && request.machineryItems.length > 0 && (
          <div>
            <Label className="text-base mb-3 flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Assign Labs to Machinery
            </Label>
            <div className="space-y-3">
              {request.machineryItems.map((item: any) => (
                <div key={item._id} className="border rounded-lg p-3">
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">{item.machinery?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Category: {item.machinery?.category?.name}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`lab-${item._id}`}>Assign Lab *</Label>
                      <Select
                        value={approvalData.labAssignments[item._id]}
                        onValueChange={(value) =>
                          setApprovalData({
                            ...approvalData,
                            labAssignments: { ...approvalData.labAssignments, [item._id]: value },
                          })
                        }
                      >
                        <SelectTrigger id={`lab-${item._id}`}>
                          <SelectValue placeholder="Select lab" />
                        </SelectTrigger>
                        <SelectContent>
                          {labs
                            .filter((lab) => lab.category?._id === item.machinery?.category?._id)
                            .map((lab) => (
                              <SelectItem key={lab._id} value={lab._id}>
                                {lab.name} - {lab.siteId?.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Total Amount: <span className="font-semibold">{formatCurrency(request.totals?.total || 0)}</span>
          </p>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={() => setMode('view')} disabled={loading}>
          Back
        </Button>
        <Button onClick={handleApprove} disabled={loading}>
          {loading ? 'Approving...' : 'Confirm Approval'}
        </Button>
      </DialogFooter>
    </>
  );

  const renderRejectMode = () => (
    <>
      <div className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm font-medium">You are about to reject this request</p>
          <p className="text-sm text-muted-foreground mt-1">
            The customer will be notified of the rejection with the reason provided.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason for Rejection *</Label>
          <Textarea
            id="reason"
            value={rejectionData.reason}
            onChange={(e) => setRejectionData({ reason: e.target.value })}
            placeholder="e.g., Requested equipment not available, Insufficient documentation, etc."
            rows={5}
          />
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={() => setMode('view')} disabled={loading}>
          Back
        </Button>
        <Button variant="destructive" onClick={handleReject} disabled={loading}>
          {loading ? 'Rejecting...' : 'Confirm Rejection'}
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setOpen(true);
            setMode('view');
          }}
        >
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === 'view' && 'Request Details'}
            {mode === 'approve' && 'Approve Request'}
            {mode === 'reject' && 'Reject Request'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'view' && `Request #${request.requestNumber} from ${request.organizationId?.name}`}
            {mode === 'approve' && 'Set schedule and assign labs to approve this request'}
            {mode === 'reject' && 'Provide a reason for rejecting this request'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'view' && renderViewMode()}
        {mode === 'approve' && renderApproveMode()}
        {mode === 'reject' && renderRejectMode()}
      </DialogContent>
    </Dialog>
  );
}
