'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Save, Bell, DollarSign, Mail, Shield, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Platform settings state
  const [settings, setSettings] = useState({
    // General
    platformName: 'Earth to Orbit',
    platformDescription: 'Satellite Testing & Booking Platform',
    supportEmail: 'support@earthtoorbit.com',
    contactPhone: '+91-XXX-XXX-XXXX',

    // Financial
    currency: 'INR',
    taxRate: 18,
    paymentTermsDays: 30,
    latePaymentFee: 5,

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    adminEmailAlerts: true,
    requestApprovalAlerts: true,
    paymentReceivedAlerts: true,

    // Booking
    autoApproveRequests: false,
    requirePaymentProof: true,
    allowCancellations: true,
    cancellationDeadlineHours: 48,

    // Email Templates
    requestApprovedTemplate: '',
    requestRejectedTemplate: '',
    invoiceTemplate: '',
    paymentReceivedTemplate: '',
  });

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      // TODO: Implement API call to save settings
      // await apiClient.put('/api/admin/settings', settings);

      toast({
        title: 'Settings Saved',
        description: `${section} settings have been updated successfully`,
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-slate-600 mt-2">Configure platform-wide settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="booking">Booking Rules</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                General Information
              </CardTitle>
              <CardDescription>Basic platform information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platformDescription">Platform Description</Label>
                <Textarea
                  id="platformDescription"
                  value={settings.platformDescription}
                  onChange={(e) => setSettings({ ...settings, platformDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                />
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={() => handleSave('General')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Settings */}
        <TabsContent value="financial" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Configuration
              </CardTitle>
              <CardDescription>Currency, tax rates, and payment terms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => setSettings({ ...settings, currency: value })}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms (Days)</Label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    min="0"
                    value={settings.paymentTermsDays}
                    onChange={(e) => setSettings({ ...settings, paymentTermsDays: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-slate-500">Number of days before invoice is due</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lateFee">Late Payment Fee (%)</Label>
                  <Input
                    id="lateFee"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.latePaymentFee}
                    onChange={(e) => setSettings({ ...settings, latePaymentFee: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-slate-500">Percentage charged on overdue invoices</p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Financial')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure email and SMS notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-slate-600">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-slate-600">Send notifications via SMS</p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                  />
                </div>

                <Separator />

                <p className="text-sm font-semibold text-slate-600">Admin Alerts</p>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Request Approval Alerts</p>
                    <p className="text-sm text-slate-600">Notify when new requests need review</p>
                  </div>
                  <Switch
                    checked={settings.requestApprovalAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, requestApprovalAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Payment Received Alerts</p>
                    <p className="text-sm text-slate-600">Notify when payments are received</p>
                  </div>
                  <Switch
                    checked={settings.paymentReceivedAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, paymentReceivedAlerts: checked })}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Notifications')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Rules */}
        <TabsContent value="booking" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Booking Rules
              </CardTitle>
              <CardDescription>Configure booking and cancellation policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Auto-Approve Requests</p>
                    <p className="text-sm text-slate-600">Automatically approve all booking requests</p>
                  </div>
                  <Switch
                    checked={settings.autoApproveRequests}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoApproveRequests: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Require Payment Proof</p>
                    <p className="text-sm text-slate-600">Organizations must upload payment confirmation</p>
                  </div>
                  <Switch
                    checked={settings.requirePaymentProof}
                    onCheckedChange={(checked) => setSettings({ ...settings, requirePaymentProof: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Allow Cancellations</p>
                    <p className="text-sm text-slate-600">Organizations can cancel approved requests</p>
                  </div>
                  <Switch
                    checked={settings.allowCancellations}
                    onCheckedChange={(checked) => setSettings({ ...settings, allowCancellations: checked })}
                  />
                </div>

                {settings.allowCancellations && (
                  <div className="space-y-2 ml-4">
                    <Label htmlFor="cancellationDeadline">Cancellation Deadline (Hours)</Label>
                    <Input
                      id="cancellationDeadline"
                      type="number"
                      min="0"
                      value={settings.cancellationDeadlineHours}
                      onChange={(e) => setSettings({ ...settings, cancellationDeadlineHours: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-slate-500">
                      Minimum hours before scheduled time to allow cancellation
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Booking Rules')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Platform security and access control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Security settings require careful consideration.
                  Changes may affect user access and platform functionality.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Session Timeout</Label>
                  <Select defaultValue="24">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="168">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">Time before user sessions expire</p>
                </div>

                <div className="space-y-2">
                  <Label>Password Policy</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Min 6 characters)</SelectItem>
                      <SelectItem value="medium">Medium (Min 8 characters, mixed case)</SelectItem>
                      <SelectItem value="high">High (Min 12 characters, symbols required)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-600">
                    Enable 2FA for enhanced security (Coming Soon)
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Configure 2FA
                  </Button>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <p className="font-medium">API Access Tokens</p>
                  <p className="text-sm text-slate-600">
                    Manage API keys and integrations (Coming Soon)
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Manage Tokens
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={() => handleSave('Security')} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
