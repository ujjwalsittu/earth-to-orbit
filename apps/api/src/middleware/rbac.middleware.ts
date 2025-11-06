import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import ApiError from '../utils/api-error';

/**
 * Role-based access control middleware
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }

    next();
  };
};

/**
 * Check if user is platform admin
 */
export const isPlatformAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (req.user.role !== UserRole.PLATFORM_ADMIN) {
    throw ApiError.forbidden('Platform admin access required');
  }

  next();
};

/**
 * Check if user is org admin or higher
 */
export const isOrgAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (req.user.role !== UserRole.ORG_ADMIN && req.user.role !== UserRole.PLATFORM_ADMIN) {
    throw ApiError.forbidden('Organization admin access required');
  }

  next();
};

/**
 * Check if user belongs to the same organization or is platform admin
 */
export const sameOrganizationOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  const organizationId = req.params.organizationId || req.body.organization;

  if (req.user.role === UserRole.PLATFORM_ADMIN) {
    return next();
  }

  if (!req.user.organization) {
    throw ApiError.forbidden('User does not belong to any organization');
  }

  if (req.user.organization.toString() !== organizationId) {
    throw ApiError.forbidden('You can only access resources from your organization');
  }

  next();
};

export default authorize;
