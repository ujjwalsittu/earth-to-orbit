'use client';

import { useEffect, useState } from 'react';
import { Package, Plus, Edit, Trash2, Search } from 'lucide-react';
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
import { CreateComponentDialog } from '@/components/admin/create-component-dialog';

export default function AdminComponentsPage() {
  const [components, setComponents] = useState<any[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadComponents();
  }, []);

  useEffect(() => {
    filterComponents();
  }, [components, searchQuery]);

  const loadComponents = async () => {
    try {
      const response: any = await apiClient.getComponents();
      if (response.success) {
        const allComponents = response.data?.components || [];
        setComponents(allComponents);
      }
    } catch (error) {
      console.error('Failed to load components', error);
    } finally {
      setLoading(false);
    }
  };

  const filterComponents = () => {
    let filtered = [...components];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.sku?.toLowerCase().includes(query) ||
          c.category?.name?.toLowerCase().includes(query) ||
          c.site?.name?.toLowerCase().includes(query)
      );
    }

    setFilteredComponents(filtered);
  };

  const handleDelete = async (componentId: string, componentName: string) => {
    if (!confirm(`Are you sure you want to delete "${componentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response: any = await apiClient.delete(`/api/components/${componentId}`);
      if (response.success) {
        toast({
          title: 'Component Deleted',
          description: `${componentName} has been removed successfully`,
        });
        loadComponents();
      }
    } catch (error: any) {
      toast({
        title: 'Deletion Failed',
        description: error?.message || 'Failed to delete component',
        variant: 'destructive',
      });
    }
  };

  const getStatusCounts = () => {
    const totalStock = components.reduce((sum, c) => sum + (c.quantityInStock || 0), 0);
    const totalValue = components.reduce((sum, c) => sum + ((c.quantityInStock || 0) * (c.unitPrice || 0)), 0);

    return {
      active: components.filter((c) => c.isActive).length,
      inactive: components.filter((c) => !c.isActive).length,
      total: components.length,
      totalStock,
      totalValue,
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Components</h1>
          <p className="text-slate-600 mt-2">Manage satellite components and inventory</p>
        </div>
        <CreateComponentDialog onSuccess={loadComponents}>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Component
          </Button>
        </CreateComponentDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Components</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{counts.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{counts.active}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Stock</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{counts.totalStock}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Inventory Value</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(counts.totalValue)}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Components Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Components</CardTitle>
              <CardDescription>Manage satellite parts and components inventory</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, SKU, category, or site..."
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
          ) : filteredComponents.length > 0 ? (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">SKU</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Site</TableHead>
                    <TableHead className="font-semibold">Unit Price</TableHead>
                    <TableHead className="font-semibold">Rental/Day</TableHead>
                    <TableHead className="font-semibold">Stock</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComponents.map((component) => (
                    <TableRow key={component._id} className="hover:bg-slate-50">
                      <TableCell className="font-mono text-sm">{component.sku}</TableCell>
                      <TableCell className="font-semibold">{component.name}</TableCell>
                      <TableCell className="text-slate-600">{component.category?.name || 'N/A'}</TableCell>
                      <TableCell className="text-slate-600">{component.site?.name || 'N/A'}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(component.unitPrice)}</TableCell>
                      <TableCell className="font-medium text-blue-600">{formatCurrency(component.rentalRatePerDay)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            (component.quantityInStock || 0) > (component.minStockLevel || 0)
                              ? 'bg-green-100 text-green-800 border-green-200 border'
                              : 'bg-red-100 text-red-800 border-red-200 border'
                          }
                        >
                          {component.quantityInStock || 0} units
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={component.isActive ? 'bg-green-100 text-green-800 border-green-200 border' : 'bg-slate-100 text-slate-800 border-slate-200 border'}>
                          {component.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <CreateComponentDialog component={component} onSuccess={loadComponents}>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </CreateComponentDialog>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(component._id, component.name)}
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
              <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No components found</p>
              <p className="text-slate-500 text-sm mt-1">
                {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first component'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
