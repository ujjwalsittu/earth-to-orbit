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

export function CreateComponentDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    description: '',
    manufacturer: '',
    partNumber: '',
    unitPrice: 0,
    rentalRatePerDay: 0,
    stockQuantity: 0,
    availableQuantity: 0,
    minimumOrderQuantity: 1,
    leadTimeDays: 0,
    hsnCode: '',
  });

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      const response: any = await apiClient.getCategories();
      if (response.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.sku || !formData.name || !formData.category) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (SKU, Name, Category)',
        variant: 'destructive',
      });
      return;
    }

    if (formData.unitPrice <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Unit price must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (formData.stockQuantity < 0 || formData.availableQuantity < 0) {
      toast({
        title: 'Validation Error',
        description: 'Stock quantities cannot be negative',
        variant: 'destructive',
      });
      return;
    }

    if (formData.availableQuantity > formData.stockQuantity) {
      toast({
        title: 'Validation Error',
        description: 'Available quantity cannot exceed stock quantity',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        rentalRatePerDay: formData.rentalRatePerDay || undefined,
        hsnCode: formData.hsnCode || undefined,
      };

      const response: any = await apiClient.post('/api/admin/catalog/components', payload);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Component created successfully',
        });
        setOpen(false);
        setFormData({
          sku: '',
          name: '',
          category: '',
          description: '',
          manufacturer: '',
          partNumber: '',
          unitPrice: 0,
          rentalRatePerDay: 0,
          stockQuantity: 0,
          availableQuantity: 0,
          minimumOrderQuantity: 1,
          leadTimeDays: 0,
          hsnCode: '',
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to create component',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create component',
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
          Add Component
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Component</DialogTitle>
          <DialogDescription>Add new testing component or part to inventory</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="COMP-001"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Component Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Temperature Sensor Module"
              />
            </div>
          </div>

          {/* Category and Manufacturer */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="Manufacturer name"
              />
            </div>
          </div>

          {/* Part Number and HSN Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                placeholder="PN-12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hsnCode">HSN Code</Label>
              <Input
                id="hsnCode"
                value={formData.hsnCode}
                onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                placeholder="8517"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the component"
              rows={3}
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price (INR) *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                placeholder="5000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rentalRatePerDay">Rental Rate per Day (INR)</Label>
              <Input
                id="rentalRatePerDay"
                type="number"
                min="0"
                step="0.01"
                value={formData.rentalRatePerDay}
                onChange={(e) => setFormData({ ...formData, rentalRatePerDay: parseFloat(e.target.value) || 0 })}
                placeholder="500"
              />
              <p className="text-xs text-muted-foreground">Optional: for rental components</p>
            </div>
          </div>

          {/* Stock Information */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock Quantity *</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => {
                  const stock = parseInt(e.target.value) || 0;
                  setFormData({
                    ...formData,
                    stockQuantity: stock,
                    availableQuantity: Math.min(formData.availableQuantity, stock),
                  });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableQuantity">Available Quantity *</Label>
              <Input
                id="availableQuantity"
                type="number"
                min="0"
                max={formData.stockQuantity}
                value={formData.availableQuantity}
                onChange={(e) => setFormData({ ...formData, availableQuantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumOrderQuantity">Min Order Qty</Label>
              <Input
                id="minimumOrderQuantity"
                type="number"
                min="1"
                value={formData.minimumOrderQuantity}
                onChange={(e) => setFormData({ ...formData, minimumOrderQuantity: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          {/* Lead Time */}
          <div className="space-y-2">
            <Label htmlFor="leadTimeDays">Lead Time (days)</Label>
            <Input
              id="leadTimeDays"
              type="number"
              min="0"
              value={formData.leadTimeDays}
              onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value) || 0 })}
              placeholder="7"
            />
            <p className="text-xs text-muted-foreground">
              Number of days required for procurement/availability if out of stock
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Component'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
