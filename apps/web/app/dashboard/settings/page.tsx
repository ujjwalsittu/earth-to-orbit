'use client';

import { useEffect, useState } from 'react';
import { User, Building2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';

export default function SettingsPage() {
  const { user, setAuth } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [organizationData, setOrganizationData] = useState({
    name: '',
    gstNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
    contactEmail: '',
    contactPhone: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // For authenticated user, organizationId is always a string
      const orgId = typeof user?.organizationId === 'string' ? user.organizationId : (user?.organizationId as any)?._id;
      const [userRes, orgRes]: any = await Promise.all([
        apiClient.get('/api/auth/me'),
        apiClient.get(`/api/organizations/${orgId}`),
      ]);

      if (userRes.data?.success) {
        const userData = userRes.data.data;
        setProfileData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });
      }

      if (orgRes.data?.success) {
        const orgData = orgRes.data.data;
        setOrganizationData({
          name: orgData.name || '',
          gstNumber: orgData.gstNumber || '',
          address: {
            street: orgData.address?.street || '',
            city: orgData.address?.city || '',
            state: orgData.address?.state || '',
            postalCode: orgData.address?.postalCode || '',
            country: orgData.address?.country || 'India',
          },
          contactEmail: orgData.contactEmail || '',
          contactPhone: orgData.contactPhone || '',
        });
      }
    } catch (error) {
      console.error('Failed to load user data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response: any = await apiClient.put('/api/users/profile', profileData);
      if (response.data?.success) {
        // Update auth store with new user data
        setAuth({ ...user, ...profileData } as any, localStorage.getItem('token') || '');
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error?.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'New password and confirm password must match',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      await apiClient.put('/api/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully',
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error?.response?.data?.message || 'Failed to update password',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const orgId = typeof user?.organizationId === 'string' ? user.organizationId : (user?.organizationId as any)?._id;
      await apiClient.put(`/api/organizations/${orgId}`, organizationData);
      toast({
        title: 'Organization updated',
        description: 'Organization details have been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error?.response?.data?.message || 'Failed to update organization',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and organization settings</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="organization">
            <Building2 className="h-4 w-4 mr-2" />
            Organization
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>

                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                {user?.role === 'ORG_ADMIN'
                  ? 'Update your organization information'
                  : 'View your organization information (Only admins can edit)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <form onSubmit={handleUpdateOrganization} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input
                      id="orgName"
                      value={organizationData.name}
                      onChange={(e) => setOrganizationData({ ...organizationData, name: e.target.value })}
                      disabled={user?.role !== 'ORG_ADMIN'}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                    <Input
                      id="gstNumber"
                      value={organizationData.gstNumber}
                      onChange={(e) => setOrganizationData({ ...organizationData, gstNumber: e.target.value })}
                      disabled={user?.role !== 'ORG_ADMIN'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={organizationData.address.street}
                      onChange={(e) => setOrganizationData({
                        ...organizationData,
                        address: { ...organizationData.address, street: e.target.value }
                      })}
                      disabled={user?.role !== 'ORG_ADMIN'}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={organizationData.address.city}
                        onChange={(e) => setOrganizationData({
                          ...organizationData,
                          address: { ...organizationData.address, city: e.target.value }
                        })}
                        disabled={user?.role !== 'ORG_ADMIN'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={organizationData.address.state}
                        onChange={(e) => setOrganizationData({
                          ...organizationData,
                          address: { ...organizationData.address, state: e.target.value }
                        })}
                        disabled={user?.role !== 'ORG_ADMIN'}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={organizationData.address.postalCode}
                        onChange={(e) => setOrganizationData({
                          ...organizationData,
                          address: { ...organizationData.address, postalCode: e.target.value }
                        })}
                        disabled={user?.role !== 'ORG_ADMIN'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={organizationData.address.country}
                        onChange={(e) => setOrganizationData({
                          ...organizationData,
                          address: { ...organizationData.address, country: e.target.value }
                        })}
                        disabled={user?.role !== 'ORG_ADMIN'}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={organizationData.contactEmail}
                        onChange={(e) => setOrganizationData({ ...organizationData, contactEmail: e.target.value })}
                        disabled={user?.role !== 'ORG_ADMIN'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={organizationData.contactPhone}
                        onChange={(e) => setOrganizationData({ ...organizationData, contactPhone: e.target.value })}
                        disabled={user?.role !== 'ORG_ADMIN'}
                        required
                      />
                    </div>
                  </div>

                  {user?.role === 'ORG_ADMIN' && (
                    <Button type="submit" disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
