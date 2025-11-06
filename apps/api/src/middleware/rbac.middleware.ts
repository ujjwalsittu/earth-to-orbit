import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@e2o/types';
import { ForbiddenError } from '../utils/api-error';
import { AuthRequest } from './auth.middleware';

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      throw new ForbiddenError('User not authenticated');
    }

    if (!roles.includes(authReq.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}

export const requirePlatformAdmin = requireRoles(UserRole.PLATFORM_ADMIN);
export const requireOrgAdmin = requireRoles(UserRole.PLATFORM_ADMIN, UserRole.ORG_ADMIN);
export const requireOrgMember = requireRoles(
  UserRole.PLATFORM_ADMIN,
  UserRole.ORG_ADMIN,
  UserRole.ORG_MEMBER
);

export function requireSameOrganization(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authReq = req as AuthRequest;

  if (!authReq.user) {
    throw new ForbiddenError('User not authenticated');
  }

  // Platform admins can access any organization
  if (authReq.user.role === UserRole.PLATFORM_ADMIN) {
    return next();
  }

  // Get org ID from params, query, or body
  const orgId =
    req.params.organizationId || req.query.organizationId || req.body.organizationId;

  if (!orgId) {
    throw new ForbiddenError('Organization ID required');
  }

  if (authReq.user.organizationId !== orgId) {
    throw new ForbiddenError('Access denied to this organization');
  }

  next();
}
