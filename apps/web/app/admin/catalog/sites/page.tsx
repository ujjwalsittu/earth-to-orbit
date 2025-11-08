'use client';

import { useEffect, useState } from 'react';
import { MapPin, Plus, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { CreateSiteDialog } from '@/components/admin/create-site-dialog';

export default function AdminSitesPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [filteredSites, setFilteredSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    filterSites();
  }, [sites, searchQuery]);

  const loadSites = async () => {
    try {
      const response: any = await apiClient.getSites();
      if (response.success) {
        const allSites = response.data?.sites || [];
        setSites(allSites);
      }
    } catch (error) {
      console.error('Failed to load sites', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSites = () => {
    let filtered = [...sites];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name?.toLowerCase().includes(query) ||
          s.location?.toLowerCase().includes(query) ||
          s.code?.toLowerCase().includes(query)
      );
    }

    setFilteredSites(filtered);
  };

  const handleDelete = async (siteId: string, siteName: string) => {
    if (!confirm(`Are you sure you want to delete "${siteName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response: any = await apiClient.delete(`/api/sites/${siteId}`);
      if (response.success) {
        toast({
          title: 'Site Deleted',
          description: `${siteName} has been removed successfully`,
        });
        loadSites();
      }
    } catch (error: any) {
      toast({
        title: 'Deletion Failed',
        description: error?.message || 'Failed to delete site',
        variant: 'destructive',
      });
    }
  };

  const getStatusCounts = () => {
    return {
      active: sites.filter((s) => s.isActive).length,
      inactive: sites.filter((s) => !s.isActive).length,
      total: sites.length,
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Sites Management</h1>
          <p className="text-slate-600 mt-2">Manage facility locations and testing sites</p>
        </div>
        <CreateSiteDialog onSuccess={loadSites}>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Site
          </Button>
        </CreateSiteDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Sites</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{counts.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Sites</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{counts.active}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Inactive Sites</p>
                <p className="text-3xl font-bold text-slate-400 mt-2">{counts.inactive}</p>
              </div>
              <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sites Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Sites</CardTitle>
              <CardDescription>Manage and configure facility locations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, location, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredSites.length > 0 ? (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Site Code</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Facilities</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSites.map((site) => (
                    <TableRow key={site._id} className="hover:bg-slate-50">
                      <TableCell className="font-mono font-medium">{site.code}</TableCell>
                      <TableCell className="font-semibold">{site.name}</TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {site.location}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{site.facilities?.join(', ') || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={site.isActive ? 'bg-green-100 text-green-800 border-green-200 border' : 'bg-slate-100 text-slate-800 border-slate-200 border'}>
                          {site.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <CreateSiteDialog site={site} onSuccess={loadSites}>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </CreateSiteDialog>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(site._id, site.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No sites found</p>
              <p className="text-slate-500 text-sm mt-1">
                {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first site'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
