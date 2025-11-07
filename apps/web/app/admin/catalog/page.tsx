'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { CreateSiteDialog } from '@/components/admin/create-site-dialog';
import { CreateLabDialog } from '@/components/admin/create-lab-dialog';
import { CreateComponentDialog } from '@/components/admin/create-component-dialog';
import { CreateStaffDialog } from '@/components/admin/create-staff-dialog';

export default function AdminCatalogPage() {
  const [labs, setLabs] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const [labsRes, componentsRes, sitesRes, staffRes]: any = await Promise.all([
        apiClient.getLabs(),
        apiClient.getComponents(),
        apiClient.getSites(),
        apiClient.getStaff(),
      ]);

      if (labsRes.success) setLabs(labsRes.data.labs || []);
      if (componentsRes.success) setComponents(componentsRes.data.components || []);
      if (sitesRes.success) setSites(sitesRes.data.sites || []);
      if (staffRes.success) setStaff(staffRes.data.staff || []);
    } catch (error) {
      console.error('Failed to load catalog', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Catalog Management</h1>
        <p className="text-muted-foreground">Manage labs, machinery, components, and sites</p>
      </div>

      {/* Sites */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sites</CardTitle>
              <CardDescription>Physical testing centers</CardDescription>
            </div>
            <CreateSiteDialog onSuccess={loadCatalog} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Operating Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site._id}>
                  <TableCell className="font-mono">{site.code}</TableCell>
                  <TableCell className="font-medium">{site.name}</TableCell>
                  <TableCell>{`${site.location.city}, ${site.location.state}`}</TableCell>
                  <TableCell>
                    {site.operatingHours.start} - {site.operatingHours.end}
                  </TableCell>
                  <TableCell>
                    <Badge variant={site.isActive ? 'default' : 'destructive'}>
                      {site.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Labs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Labs & Machinery</CardTitle>
              <CardDescription>Testing equipment and facilities</CardDescription>
            </div>
            <CreateLabDialog onSuccess={loadCatalog} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Rate/Hour</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labs.map((lab) => (
                <TableRow key={lab._id}>
                  <TableCell className="font-mono">{lab.code}</TableCell>
                  <TableCell className="font-medium">{lab.name}</TableCell>
                  <TableCell>{lab.siteId?.name}</TableCell>
                  <TableCell>{formatCurrency(lab.ratePerHour)}</TableCell>
                  <TableCell>{lab.capacity}</TableCell>
                  <TableCell>
                    <Badge variant={lab.isActive ? 'default' : 'destructive'}>
                      {lab.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Components */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Components</CardTitle>
              <CardDescription>Satellite parts and modules</CardDescription>
            </div>
            <CreateComponentDialog onSuccess={loadCatalog} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Price/Unit</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((component) => (
                <TableRow key={component._id}>
                  <TableCell className="font-mono">{component.sku}</TableCell>
                  <TableCell className="font-medium">{component.name}</TableCell>
                  <TableCell>{component.manufacturer || 'N/A'}</TableCell>
                  <TableCell>{formatCurrency(component.pricePerUnit)}</TableCell>
                  <TableCell>{component.stockQuantity}</TableCell>
                  <TableCell>
                    <Badge variant={component.isActive ? 'default' : 'destructive'}>
                      {component.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Staff */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>Technical staff for assistance and support</CardDescription>
            </div>
            <CreateStaffDialog onSuccess={loadCatalog} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Rate/Hour</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member._id}>
                  <TableCell className="font-medium">
                    {member.firstName} {member.lastName}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.designation || 'N/A'}</TableCell>
                  <TableCell>{member.department || 'N/A'}</TableCell>
                  <TableCell>{member.ratePerHour ? formatCurrency(member.ratePerHour) : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={member.isAvailable ? 'default' : 'secondary'}>
                      {member.isAvailable ? 'Available' : 'Not Available'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
