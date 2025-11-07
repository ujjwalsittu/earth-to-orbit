'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';

export function CreateLabDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    site: '',
    category: '',
    description: '',
    ratePerHour: 0,
    slotGranularityMinutes: 60,
    operatingWindow: {
      start: '09:00',
      end: '18:00',
    },
    timezone: 'Asia/Kolkata',
    capacityUnits: 1,
    leadTimeDays: 0,
  });

  useEffect(() => {
    if (open) {
      loadOptions();
    }
  }, [open]);

  const loadOptions = async () => {
    try {
      const [sitesRes, categoriesRes]: any = await Promise.all([
        apiClient.getSites(),
        apiClient.getCategories(),
      ]);

      if (sitesRes.success) setSites(sitesRes.data.sites || []);
      if (categoriesRes.success) setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Failed to load options', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code || !formData.site || !formData.category) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (formData.ratePerHour <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Rate per hour must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response: any = await apiClient.post('/api/admin/catalog/labs', formData);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Lab created successfully',
        });
        setOpen(false);
        setFormData({
          name: '',
          code: '',
          site: '',
          category: '',
          description: '',
          ratePerHour: 0,
          slotGranularityMinutes: 60,
          operatingWindow: { start: '09:00', end: '18:00' },
          timezone: 'Asia/Kolkata',
          capacityUnits: 1,
          leadTimeDays: 0,
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to create lab',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create lab',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Lab
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Lab/Machinery</DialogTitle>
          <DialogDescription>Add new testing equipment or facility</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Lab Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="TVAC Chamber (Large)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Lab Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="TVAC-001"
              />
            </div>
          </div>

          {/* Site and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site">Site *</Label>
              <Select value={formData.site} onValueChange={(value) => setFormData({ ...formData, site: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site._id} value={site._id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the lab and its capabilities"
              rows={3}
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ratePerHour">Rate per Hour (INR) *</Label>
              <Input
                id="ratePerHour"
                type="number"
                min="0"
                value={formData.ratePerHour}
                onChange={(e) => setFormData({ ...formData, ratePerHour: parseFloat(e.target.value) || 0 })}
                placeholder="15000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slotGranularity">Slot Granularity (minutes) *</Label>
              <Select
                value={formData.slotGranularityMinutes.toString()}
                onValueChange={(value) => setFormData({ ...formData, slotGranularityMinutes: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Operating Window */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Operating Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.operatingWindow.start}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    operatingWindow: { ...formData.operatingWindow, start: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Operating End Time *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.operatingWindow.end}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    operatingWindow: { ...formData.operatingWindow, end: e.target.value },
                  })
                }
              />
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacityUnits">Capacity Units</Label>
              <Input
                id="capacityUnits"
                type="number"
                min="1"
                value={formData.capacityUnits}
                onChange={(e) => setFormData({ ...formData, capacityUnits: parseInt(e.target.value) || 1 })}
              />
              <p className="text-xs text-muted-foreground">1 = Exclusive use, &gt;1 = Can be shared</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadTimeDays">Lead Time (days)</Label>
              <Input
                id="leadTimeDays"
                type="number"
                min="0"
                value={formData.leadTimeDays}
                onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 0 })}
                placeholder="14"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Lab'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
