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

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response: any = await apiClient.login(formData.email, formData.password);

      if (response.success && response.data) {
        // API returns `accessToken` and `refreshToken`; use access token for auth
        setAuth(response.data.user, response.data.accessToken);
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });

        // Redirect based on role
        if (response.data.user.role === 'PLATFORM_ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error?.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Satellite className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            <span className="text-xl sm:text-2xl font-bold">{config.company.name}</span>
          </div>
          <CardTitle className="text-2xl text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-500 hover:underline">
              Register your organization
            </Link>
          </div>
          {config.isDevelopment && (
            <div className="mt-6 p-4 bg-muted rounded-md">
              <p className="text-xs font-semibold mb-2">Demo Credentials:</p>
              <p className="text-xs text-muted-foreground">
                <strong>Admin:</strong> {config.demo.adminEmail} / {config.demo.adminPassword}
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Org Admin:</strong> {config.demo.orgAdminEmail} / {config.demo.orgAdminPassword}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
