'use client';

import { useEffect, useState } from 'react';
import { Wrench, Plus, Edit, Trash2, Search } from 'lucide-react';
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
import { formatCurrency } from '@/lib/utils';
import { CreateLabDialog } from '@/components/admin/create-lab-dialog';

export default function AdminLabsPage() {
  const [labs, setLabs] = useState<any[]>([]);
  const [filteredLabs, setFilteredLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadLabs();
  }, []);

  useEffect(() => {
    filterLabs();
  }, [labs, searchQuery]);

  const loadLabs = async () => {
    try {
      const response: any = await apiClient.getLabs();
      if (response.success) {
        const allLabs = response.data?.labs || [];
        setLabs(allLabs);
      }
    } catch (error) {
      console.error('Failed to load labs', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLabs = () => {
    let filtered = [...labs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.name?.toLowerCase().includes(query) ||
          l.category?.name?.toLowerCase().includes(query) ||
          l.site?.name?.toLowerCase().includes(query)
      );
    }

    setFilteredLabs(filtered);
  };

  const handleDelete = async (labId: string, labName: string) => {
    if (!confirm(`Are you sure you want to delete "${labName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response: any = await apiClient.delete(`/api/labs/${labId}`);
      if (response.success) {
        toast({
          title: 'Lab Deleted',
          description: `${labName} has been removed successfully`,
        });
        loadLabs();
      }
    } catch (error: any) {
      toast({
        title: 'Deletion Failed',
        description: error?.message || 'Failed to delete lab',
        variant: 'destructive',
      });
    }
  };

  const getStatusCounts = () => {
    return {
      active: labs.filter((l) => l.isActive).length,
      inactive: labs.filter((l) => !l.isActive).length,
      total: labs.length,
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Labs & Machinery</h1>
          <p className="text-slate-600 mt-2">Manage testing equipment and laboratory facilities</p>
        </div>
        <CreateLabDialog onSuccess={loadLabs}>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Lab
          </Button>
        </CreateLabDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Labs</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{counts.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Labs</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{counts.active}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Wrench className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg. Hourly Rate</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {labs.length > 0
                    ? formatCurrency(labs.reduce((sum, l) => sum + (l.ratePerHour || 0), 0) / labs.length)
                    : formatCurrency(0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Labs Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Labs</CardTitle>
              <CardDescription>Manage testing equipment and machinery</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, category, or site..."
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
          ) : filteredLabs.length > 0 ? (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Site</TableHead>
                    <TableHead className="font-semibold">Rate/Hour</TableHead>
                    <TableHead className="font-semibold">Capacity</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLabs.map((lab) => (
                    <TableRow key={lab._id} className="hover:bg-slate-50">
                      <TableCell className="font-semibold">{lab.name}</TableCell>
                      <TableCell className="text-slate-600">{lab.category?.name || 'N/A'}</TableCell>
                      <TableCell className="text-slate-600">{lab.site?.name || 'N/A'}</TableCell>
                      <TableCell className="font-medium text-blue-600">{formatCurrency(lab.ratePerHour)}</TableCell>
                      <TableCell className="text-slate-600">{lab.capacity || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={lab.isActive ? 'bg-green-100 text-green-800 border-green-200 border' : 'bg-slate-100 text-slate-800 border-slate-200 border'}>
                          {lab.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <CreateLabDialog lab={lab} onSuccess={loadLabs}>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </CreateLabDialog>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(lab._id, lab.name)}
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
              <Wrench className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No labs found</p>
              <p className="text-slate-500 text-sm mt-1">
                {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first lab'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
