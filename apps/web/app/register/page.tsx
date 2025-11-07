'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Satellite } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import { config } from '@/lib/config';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    organization: {
      name: '',
      legalName: '',
      registrationNumber: '',
      gstNumber: '',
      industry: 'Satellite Manufacturing',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'India',
        postalCode: '',
      },
      contactEmail: '',
      contactPhone: '',
    },
    user: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response: any = await apiClient.register(formData);

      if (response.success && response.data) {
        // Use access token returned by API
        setAuth(response.data.user, response.data.accessToken);
        toast({
          title: 'Registration successful',
          description: 'Welcome to Earth To Orbit!',
        });
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error?.message || 'Please check your information and try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Satellite className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            <span className="text-xl sm:text-2xl font-bold">{config.company.name}</span>
          </div>
          <CardTitle className="text-2xl text-center">Register Your Organization</CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? 'Organization Information' : 'Admin User Information'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      value={formData.organization.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization: { ...formData.organization, name: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legalName">Legal Name *</Label>
                    <Input
                      id="legalName"
                      value={formData.organization.legalName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization: { ...formData.organization, legalName: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">CIN/Registration Number *</Label>
                    <Input
                      id="registrationNumber"
                      placeholder="U12345KA2024PTC123456"
                      value={formData.organization.registrationNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization: {
                            ...formData.organization,
                            registrationNumber: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                    <Input
                      id="gstNumber"
                      placeholder="29ABCDE1234F1Z5"
                      value={formData.organization.gstNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization: { ...formData.organization, gstNumber: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Address *</Label>
                  <Input
                    id="street"
                    value={formData.organization.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organization: {
                          ...formData.organization,
                          address: { ...formData.organization.address, street: e.target.value },
                        },
                      })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.organization.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization: {
                            ...formData.organization,
                            address: { ...formData.organization.address, city: e.target.value },
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.organization.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization: {
                            ...formData.organization,
                            address: { ...formData.organization.address, state: e.target.value },
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      placeholder="560001"
                      value={formData.organization.address.postalCode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization: {
                            ...formData.organization,
                            address: {
                              ...formData.organization.address,
                              postalCode: e.target.value,
                            },
                          },
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.organization.contactEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization: {
                            ...formData.organization,
                            contactEmail: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone *</Label>
                    <Input
                      id="contactPhone"
                      placeholder="+91-80-12345678"
                      value={formData.organization.contactPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization: {
                            ...formData.organization,
                            contactPhone: e.target.value,
                          },
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <Button type="button" onClick={() => setStep(2)} className="w-full">
                  Continue to User Details
                </Button>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.user.firstName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          user: { ...formData.user, firstName: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.user.lastName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          user: { ...formData.user, lastName: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={formData.user.email}
                    onChange={(e) =>
                      setFormData({ ...formData, user: { ...formData.user, email: e.target.value } })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    placeholder="+91-9876543210"
                    value={formData.user.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, user: { ...formData.user, phone: e.target.value } })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 8 characters"
                    value={formData.user.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        user: { ...formData.user, password: e.target.value },
                      })
                    }
                    required
                    minLength={8}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
                    Back
                  </Button>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Registering...' : 'Complete Registration'}
                  </Button>
                </div>
              </>
            )}
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-500 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
