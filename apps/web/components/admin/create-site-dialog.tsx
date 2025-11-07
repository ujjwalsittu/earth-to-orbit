'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';

export function CreateSiteDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: {
      city: '',
      state: '',
      country: 'India',
      address: '',
      postalCode: '',
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
    facilities: '',
    contactEmail: '',
    contactPhone: '',
    operatingHours: {
      monday: '09:00 - 18:00',
      tuesday: '09:00 - 18:00',
      wednesday: '09:00 - 18:00',
      thursday: '09:00 - 18:00',
      friday: '09:00 - 18:00',
      saturday: '10:00 - 16:00',
      sunday: 'Closed',
    },
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.location.city || !formData.contactEmail) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        facilities: formData.facilities.split(',').map((f) => f.trim()).filter(Boolean),
      };

      const response: any = await apiClient.post('/api/admin/catalog/sites', payload);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Site created successfully',
        });
        setOpen(false);
        setFormData({
          name: '',
          code: '',
          location: {
            city: '',
            state: '',
            country: 'India',
            address: '',
            postalCode: '',
            coordinates: { latitude: 0, longitude: 0 },
          },
          facilities: '',
          contactEmail: '',
          contactPhone: '',
          operatingHours: {
            monday: '09:00 - 18:00',
            tuesday: '09:00 - 18:00',
            wednesday: '09:00 - 18:00',
            thursday: '09:00 - 18:00',
            friday: '09:00 - 18:00',
            saturday: '10:00 - 16:00',
            sunday: 'Closed',
          },
        });
        onSuccess?.();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to create site',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create site',
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
          Add Site
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Site</DialogTitle>
          <DialogDescription>Add a new testing facility location</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Site Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bangalore Space Research Center"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Site Code (Optional)</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="BLR-01"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Address *</Label>
            <Textarea
              value={formData.location.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, address: e.target.value },
                })
              }
              placeholder="Street address"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.location.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, city: e.target.value },
                  })
                }
                placeholder="Bangalore"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.location.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, state: e.target.value },
                  })
                }
                placeholder="Karnataka"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.location.postalCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, postalCode: e.target.value },
                  })
                }
                placeholder="560100"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="bangalore@earth-to-orbit.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone *</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+91-80-4567-8900"
              />
            </div>
          </div>

          {/* Facilities */}
          <div className="space-y-2">
            <Label htmlFor="facilities">Facilities (comma-separated)</Label>
            <Input
              id="facilities"
              value={formData.facilities}
              onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
              placeholder="TVAC Chamber, Vibration Test, Clean Room"
            />
            <p className="text-xs text-muted-foreground">
              Enter facility names separated by commas
            </p>
          </div>

          {/* Coordinates (Optional) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude (Optional)</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={formData.location.coordinates.latitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      coordinates: {
                        ...formData.location.coordinates,
                        latitude: parseFloat(e.target.value) || 0,
                      },
                    },
                  })
                }
                placeholder="12.8456"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude (Optional)</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={formData.location.coordinates.longitude}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: {
                      ...formData.location,
                      coordinates: {
                        ...formData.location.coordinates,
                        longitude: parseFloat(e.target.value) || 0,
                      },
                    },
                  })
                }
                placeholder="77.6632"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Site'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
