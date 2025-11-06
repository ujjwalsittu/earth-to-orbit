'use client';

import { useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';

interface ExtensionRequestDialogProps {
  requestId: string;
  currentEnd: string;
  onSuccess?: () => void;
}

export default function ExtensionRequestDialog({
  requestId,
  currentEnd,
  onSuccess,
}: ExtensionRequestDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    additionalHours: '',
    requestedEnd: '',
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response: any = await apiClient.post(`/api/requests/${requestId}/extension`, {
        additionalHours: parseInt(formData.additionalHours),
        requestedEnd: formData.requestedEnd,
        reason: formData.reason,
      });

      if (response.data.success) {
        toast({
          title: 'Extension request submitted',
          description: 'Your extension request has been submitted for review',
        });
        setOpen(false);
        setFormData({ additionalHours: '', requestedEnd: '', reason: '' });
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Submission failed',
        description: error?.response?.data?.message || 'Failed to submit extension request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateNewEndTime = () => {
    if (!formData.additionalHours) return '';
    const currentEndDate = new Date(currentEnd);
    const additionalHours = parseInt(formData.additionalHours);
    const newEndDate = new Date(currentEndDate.getTime() + additionalHours * 60 * 60 * 1000);
    return newEndDate.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Request Extension
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Booking Extension</DialogTitle>
          <DialogDescription>
            Request additional hours for your booking. Subject to availability and admin approval.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current End Time</Label>
            <Input
              type="text"
              value={new Date(currentEnd).toLocaleString()}
              disabled
              className="bg-slate-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalHours">Additional Hours *</Label>
            <Input
              id="additionalHours"
              type="number"
              min="1"
              max="24"
              placeholder="e.g., 2"
              value={formData.additionalHours}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  additionalHours: e.target.value,
                  requestedEnd: calculateNewEndTime(),
                });
              }}
              required
            />
            <p className="text-xs text-muted-foreground">
              How many additional hours do you need?
            </p>
          </div>

          {formData.additionalHours && (
            <div className="space-y-2">
              <Label>New End Time</Label>
              <Input
                type="text"
                value={
                  calculateNewEndTime()
                    ? new Date(calculateNewEndTime()).toLocaleString()
                    : ''
                }
                disabled
                className="bg-slate-50 font-semibold text-green-700"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Extension *</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Additional testing required due to unexpected results"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              Briefly explain why you need additional time
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Review Process</p>
                <p className="text-xs text-blue-700 mt-1">
                  Extension requests are typically reviewed within 2-4 hours. You'll be notified via
                  email once your request is approved or rejected. Additional charges will apply
                  based on hourly rates.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
