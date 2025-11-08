'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

export default function NewRequestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Catalog data
  const [sites, setSites] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    machineryItems: [
      {
        labId: '',
        siteId: '',
        requestedStart: '',
        requestedEnd: '',
        durationHours: 0,
        notes: '',
      },
    ],
    componentItems: [] as any[],
    assistanceItems: [] as any[],
  });

  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    calculateEstimatedCost();
  }, [formData, labs, components]);

  const loadCatalog = async () => {
    try {
      const [sitesRes, labsRes, componentsRes]: any = await Promise.all([
        apiClient.getSites(),
        apiClient.getLabs(),
        apiClient.getComponents(),
      ]);

      if (sitesRes.success) setSites(sitesRes.data || []);
      if (labsRes.success) setLabs(labsRes.data || []);
      if (componentsRes.success) setComponents(componentsRes.data || []);
    } catch (error) {
      console.error('Failed to load catalog', error);
    }
  };

  const calculateEstimatedCost = () => {
    let total = 0;
    let breakdown = { machinery: 0, components: 0, assistance: 0 };

    // Calculate machinery costs
    formData.machineryItems.forEach((item) => {
      const lab = labs.find((l) => l._id === item.labId);
      if (lab && item.requestedStart && item.requestedEnd) {
        const start = new Date(item.requestedStart);
        const end = new Date(item.requestedEnd);
        if (end > start) {
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          // Labs charge per hour, not per day
          const cost = (lab.ratePerHour || 0) * hours;
          breakdown.machinery += cost;
          total += cost;
        }
      }
    });

    // Calculate component costs
    formData.componentItems.forEach((item) => {
      const component = components.find((c) => c._id === item.componentId);
      if (component && item.quantity > 0 && item.startDate && item.endDate) {
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        if (end > start) {
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          const days = Math.max(1, Math.ceil(hours / 24));
          // Components charge per day for rental
          const cost = (component.rentalRatePerDay || 0) * item.quantity * days;
          breakdown.components += cost;
          total += cost;
        }
      }
    });

    // Add assistance (placeholder rate)
    formData.assistanceItems.forEach((item) => {
      if (item.hours > 0) {
        const cost = 1500 * item.hours; // ₹1500/hour average
        breakdown.assistance += cost;
        total += cost;
      }
    });

    // Add GST
    const withGst = total * 1.18;
    console.log('Cost calculation:', { breakdown, subtotal: total, withGst });
    setEstimatedCost(withGst);
  };

  const addMachineryItem = () => {
    setFormData({
      ...formData,
      machineryItems: [
        ...formData.machineryItems,
        {
          labId: '',
          siteId: '',
          requestedStart: '',
          requestedEnd: '',
          durationHours: 0,
          notes: '',
        },
      ],
    });
  };

  const removeMachineryItem = (index: number) => {
    setFormData({
      ...formData,
      machineryItems: formData.machineryItems.filter((_, i) => i !== index),
    });
  };

  const updateMachineryItem = (index: number, field: string, value: any) => {
    const updated = [...formData.machineryItems];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate duration
    if (field === 'requestedStart' || field === 'requestedEnd') {
      const start = new Date(field === 'requestedStart' ? value : updated[index].requestedStart);
      const end = new Date(field === 'requestedEnd' ? value : updated[index].requestedEnd);
      if (start && end && end > start) {
        updated[index].durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }
    }

    setFormData({ ...formData, machineryItems: updated });
  };

  const addComponentItem = () => {
    setFormData({
      ...formData,
      componentItems: [
        ...formData.componentItems,
        { componentId: '', quantity: 1, startDate: '', endDate: '', rentalDays: 0, notes: '' },
      ],
    });
  };

  const removeComponentItem = (index: number) => {
    setFormData({
      ...formData,
      componentItems: formData.componentItems.filter((_, i) => i !== index),
    });
  };

  const updateComponentItem = (index: number, field: string, value: any) => {
    const updated = [...formData.componentItems];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'startDate' || field === 'endDate') {
      const start = new Date(field === 'startDate' ? value : updated[index].startDate);
      const end = new Date(field === 'endDate' ? value : updated[index].endDate);
      if (start && end && end > start) {
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        updated[index].rentalDays = Math.max(1, Math.ceil(hours / 24));
      }
    }
    setFormData({ ...formData, componentItems: updated });
  };

  const addAssistanceItem = () => {
    setFormData({
      ...formData,
      assistanceItems: [...formData.assistanceItems, { skillRequired: '', hours: 0, notes: '' }],
    });
  };

  const removeAssistanceItem = (index: number) => {
    setFormData({
      ...formData,
      assistanceItems: formData.assistanceItems.filter((_, i) => i !== index),
    });
  };

  const updateAssistanceItem = (index: number, field: string, value: any) => {
    const updated = [...formData.assistanceItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, assistanceItems: updated });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Helper function to convert datetime-local format to ISO string
      const toISOString = (datetimeLocal: string) => {
        if (!datetimeLocal) return '';
        // datetime-local format: "2025-11-21T02:08"
        // Need to add seconds and convert to ISO: "2025-11-21T02:08:00.000Z"
        const date = new Date(datetimeLocal);
        return date.toISOString();
      };

      // Transform payload to match API schema
      const machineryItems: any[] = [];
      const components: any[] = [];

      // Labs / machinery items - API expects: lab, site, startTime, endTime, notes
      formData.machineryItems.forEach((m) => {
        if (m.labId && m.siteId && m.requestedStart && m.requestedEnd) {
          machineryItems.push({
            lab: m.labId,
            site: m.siteId,
            startTime: toISOString(m.requestedStart),
            endTime: toISOString(m.requestedEnd),
            notes: m.notes || '',
          });
        }
      });

      // Components - API expects: component, quantity, startDate, endDate
      formData.componentItems.forEach((c) => {
        if (c.componentId && c.quantity > 0) {
          const componentItem: any = {
            component: c.componentId,
            quantity: c.quantity,
          };

          // Add rental dates if provided
          if (c.startDate) {
            componentItem.startDate = toISOString(c.startDate);
          }
          if (c.endDate) {
            componentItem.endDate = toISOString(c.endDate);
          }

          components.push(componentItem);
        }
      });

      const payload = {
        title: formData.title,
        description: formData.description,
        machineryItems,
        components,
        assistanceItems: formData.assistanceItems.filter(item => item.hours > 0),
      };

      console.log('Submitting request payload:', payload);

      // Create request (server sets status SUBMITTED)
      const createRes: any = await apiClient.createRequest(payload);
      console.log('Create request response:', createRes);

      if (!createRes.success) throw new Error(createRes.message || 'Failed to create request');

      toast({
        title: 'Request submitted successfully',
        description: 'Your booking request has been sent for admin approval',
      });

      router.push('/dashboard/requests');
    } catch (error: any) {
      toast({
        title: 'Submission failed',
        description: error?.message || 'Please check your inputs and try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Booking Request</h1>
          <p className="text-muted-foreground">Step {step} of 4</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full ${
              s <= step ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Provide details about your booking request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Request Title *</Label>
              <Input
                id="title"
                placeholder="e.g., CubeSat Thermal Vacuum Testing"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your testing requirements, objectives, and any special considerations..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>
            <Button onClick={() => setStep(2)} className="w-full">
              Next: Select Labs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Labs/Machinery */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Labs & Machinery</CardTitle>
            <CardDescription>Select equipment and time slots</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.machineryItems.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Equipment #{index + 1}</h4>
                  {formData.machineryItems.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMachineryItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Site *</Label>
                    <Select
                      value={item.siteId}
                      onValueChange={(value) => updateMachineryItem(index, 'siteId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select site" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map((site) => (
                          <SelectItem key={site._id} value={site._id}>
                            {site.name} ({site.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Lab/Equipment *</Label>
                    <Select
                      value={item.labId}
                      onValueChange={(value) => updateMachineryItem(index, 'labId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lab" />
                      </SelectTrigger>
                    <SelectContent>
                        {labs
                          .filter((lab) =>
                            !item.siteId || (lab.site && (lab.site._id === item.siteId || lab.site === item.siteId))
                          )
                          .map((lab) => (
                            <SelectItem key={lab._id} value={lab._id}>
                              {lab.name} - {formatCurrency(lab.ratePerHour || 0)}/hour
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date & Time *</Label>
                    <Input
                      type="datetime-local"
                      value={item.requestedStart}
                      onChange={(e) => updateMachineryItem(index, 'requestedStart', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date & Time *</Label>
                    <Input
                      type="datetime-local"
                      value={item.requestedEnd}
                      onChange={(e) => updateMachineryItem(index, 'requestedEnd', e.target.value)}
                    />
                  </div>
                </div>

                {item.durationHours > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Duration: {item.durationHours.toFixed(1)} hours
                  </p>
                )}
              </div>
            ))}

            <Button variant="outline" onClick={addMachineryItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add More Equipment
            </Button>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Next: Components
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Components */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Components (Optional)</CardTitle>
            <CardDescription>Add satellite components or parts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
                {formData.componentItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No components added yet. Click below to add.
                  </p>
                ) : (
                  formData.componentItems.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Component #{index + 1}</h4>
                    <Button variant="ghost" size="sm" onClick={() => removeComponentItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Component *</Label>
                          <Select
                            value={item.componentId}
                            onValueChange={(value) => updateComponentItem(index, 'componentId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select component" />
                            </SelectTrigger>
                            <SelectContent>
                              {components.map((comp) => (
                                <SelectItem key={comp._id} value={comp._id}>
                                  {comp.name} - {formatCurrency(comp.rentalRatePerDay || 0)}/day
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateComponentItem(index, 'quantity', parseInt(e.target.value))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date *</Label>
                          <Input
                            type="date"
                            value={item.startDate}
                            onChange={(e) => updateComponentItem(index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date *</Label>
                          <Input
                            type="date"
                            value={item.endDate}
                            onChange={(e) => updateComponentItem(index, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>

                      {item.rentalDays > 0 && (
                        <p className="text-sm text-muted-foreground">Rental duration: {item.rentalDays} day(s)</p>
                      )}
                    </div>
                  ))
                )}

            <Button variant="outline" onClick={addComponentItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Component
            </Button>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                Next: Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Submit</CardTitle>
            <CardDescription>Confirm your booking details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Basic Information</h4>
              <p className="text-sm">
                <strong>Title:</strong> {formData.title}
              </p>
              <p className="text-sm">
                <strong>Description:</strong> {formData.description}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Equipment ({formData.machineryItems.length})</h4>
              {formData.machineryItems.map((item, index) => {
                const lab = labs.find((l) => l._id === item.labId);
                return (
                  <div key={index} className="text-sm mb-2">
                    • {lab?.name} - {item.durationHours.toFixed(1)}h
                  </div>
                );
              })}
            </div>

            {formData.componentItems.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Components ({formData.componentItems.length})</h4>
                {formData.componentItems.map((item, index) => {
                  const comp = components.find((c) => c._id === item.componentId);
                  return (
                    <div key={index} className="text-sm mb-2">
                      • {comp?.name} x {item.quantity}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-1">Estimated Cost (incl. GST)</p>
              <p className="text-2xl font-bold">{formatCurrency(estimatedCost)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Final cost will be confirmed after admin approval
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
