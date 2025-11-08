'use client';

import { useEffect, useState } from 'react';
import { UserCog, Plus, Edit, Trash2, Search } from 'lucide-react';
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
import { CreateStaffDialog } from '@/components/admin/create-staff-dialog';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staff, searchQuery]);

  const loadStaff = async () => {
    try {
      const response: any = await apiClient.getStaff();
      if (response.success) {
        const allStaff = response.data?.staff || [];
        setStaff(allStaff);
      }
    } catch (error) {
      console.error('Failed to load staff', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = [...staff];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.firstName?.toLowerCase().includes(query) ||
          s.lastName?.toLowerCase().includes(query) ||
          s.designation?.toLowerCase().includes(query) ||
          s.email?.toLowerCase().includes(query) ||
          s.expertise?.some((e: string) => e.toLowerCase().includes(query))
      );
    }

    setFilteredStaff(filtered);
  };

  const handleDelete = async (staffId: string, staffName: string) => {
    if (!confirm(`Are you sure you want to delete "${staffName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response: any = await apiClient.delete(`/api/staff/${staffId}`);
      if (response.success) {
        toast({
          title: 'Staff Member Deleted',
          description: `${staffName} has been removed successfully`,
        });
        loadStaff();
      }
    } catch (error: any) {
      toast({
        title: 'Deletion Failed',
        description: error?.message || 'Failed to delete staff member',
        variant: 'destructive',
      });
    }
  };

  const getStatusCounts = () => {
    return {
      active: staff.filter((s) => s.isActive).length,
      inactive: staff.filter((s) => !s.isActive).length,
      total: staff.length,
      avgRate: staff.length > 0
        ? staff.reduce((sum, s) => sum + (s.ratePerHour || 0), 0) / staff.length
        : 0,
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-600 mt-2">Manage technical staff and consultants</p>
        </div>
        <CreateStaffDialog onSuccess={loadStaff}>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Staff
          </Button>
        </CreateStaffDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Staff</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{counts.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCog className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Staff</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{counts.active}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserCog className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Inactive</p>
                <p className="text-3xl font-bold text-slate-400 mt-2">{counts.inactive}</p>
              </div>
              <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center">
                <UserCog className="h-6 w-6 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg. Hourly Rate</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(counts.avgRate)}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCog className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Staff Members</CardTitle>
              <CardDescription>Manage technical consultants and support staff</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, designation, or expertise..."
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
          ) : filteredStaff.length > 0 ? (
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Designation</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Rate/Hour</TableHead>
                    <TableHead className="font-semibold">Expertise</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((member) => (
                    <TableRow key={member._id} className="hover:bg-slate-50">
                      <TableCell className="font-semibold">
                        {member.firstName} {member.lastName}
                      </TableCell>
                      <TableCell className="text-slate-600">{member.designation || 'N/A'}</TableCell>
                      <TableCell className="text-slate-600">{member.email}</TableCell>
                      <TableCell className="font-medium text-blue-600">{formatCurrency(member.ratePerHour)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {member.expertise?.slice(0, 2).map((exp: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {exp}
                            </Badge>
                          ))}
                          {member.expertise?.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{member.expertise.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={member.isActive ? 'bg-green-100 text-green-800 border-green-200 border' : 'bg-slate-100 text-slate-800 border-slate-200 border'}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <CreateStaffDialog staff={member} onSuccess={loadStaff}>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </CreateStaffDialog>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(member._id, `${member.firstName} ${member.lastName}`)}
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
              <UserCog className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No staff members found</p>
              <p className="text-slate-500 text-sm mt-1">
                {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first staff member'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
