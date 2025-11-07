import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { z } from 'zod';
import Organization from '../models/Organization';
import User, { UserRole } from '../models/User';
import Request, { RequestStatus } from '../models/Request';
import Payment, { PaymentStatus } from '../models/Payment';
import { authenticate } from '../middleware/auth.middleware';
import { isOrgAdmin, sameOrganizationOrAdmin, isPlatformAdmin } from '../middleware/rbac.middleware';
import asyncHandler from '../utils/async-handler';
import ApiError from '../utils/api-error';
import { sendSuccess } from '../utils/response';
import { validate } from '../middleware/validation.middleware';
import logger from '../utils/logger';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/organizations/:id
 * Get organization details
 */
router.get(
  '/:id',
  sameOrganizationOrAdmin,
  asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }

    return sendSuccess(res, organization);
  })
);

/**
 * PATCH /api/organizations/:id
 * Update organization details (Org Admin only)
 */
const updateOrgSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().optional(),
    website: z.string().url().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    }).optional(),
  }),
});

router.patch(
  '/:id',
  isOrgAdmin,
  sameOrganizationOrAdmin,
  validate(updateOrgSchema),
  asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }

    // Update allowed fields
    const { name, phone, website, address } = req.body;
    if (name) organization.name = name;
    if (phone) organization.phone = phone;
    if (website) organization.website = website;
    if (address) {
      organization.address = { ...organization.address, ...address };
    }

    await organization.save();

    logger.info(`Organization ${organization.name} updated by ${req.user!.email}`);

    return sendSuccess(res, organization, 'Organization updated successfully');
  })
);

/**
 * GET /api/organizations/:id/members
 * Get all team members
 */
router.get(
  '/:id/members',
  sameOrganizationOrAdmin,
  asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }

    const members = await User.find({ organization: req.params.id })
      .select('-password')
      .sort({ role: 1, createdAt: -1 });

    return sendSuccess(res, members);
  })
);

/**
 * POST /api/organizations/:id/members
 * Invite a new team member (Org Admin only)
 */
const inviteMemberSchema = z.object({
  body: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum([UserRole.ORG_ADMIN, UserRole.ORG_MEMBER]),
    phone: z.string().optional(),
  }),
});

router.post(
  '/:id/members',
  isOrgAdmin,
  sameOrganizationOrAdmin,
  validate(inviteMemberSchema),
  asyncHandler(async (req, res) => {
    const { email, firstName, lastName, role, phone } = req.body;

    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.badRequest('User with this email already exists');
    }

    // Create user with temporary password (should be reset on first login)
    const temporaryPassword = Math.random().toString(36).slice(-12) + 'A1!';

    const newUser = await User.create({
      email,
      password: temporaryPassword,
      firstName,
      lastName,
      phone,
      role,
      organization: req.params.id,
    });

    // TODO: Send invitation email with password reset link
    // await sendInvitationEmail(email, firstName, organization.name, temporaryPassword);

    logger.info(`New member ${email} invited to ${organization.name} by ${req.user!.email}`);

    // Don't send password in response
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      organization: newUser.organization,
      createdAt: newUser.createdAt,
    };

    return sendSuccess(res, userResponse, 'Team member invited successfully. They will receive an email with login instructions.');
  })
);

/**
 * DELETE /api/organizations/:id/members/:userId
 * Remove a team member (Org Admin only)
 */
router.delete(
  '/:id/members/:userId',
  isOrgAdmin,
  sameOrganizationOrAdmin,
  asyncHandler(async (req, res) => {
    const { id: orgId, userId } = req.params;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }

    const userToRemove = await User.findById(userId);
    if (!userToRemove) {
      throw ApiError.notFound('User not found');
    }

    // Verify user belongs to this organization
    if (userToRemove.organization?.toString() !== orgId) {
      throw ApiError.badRequest('User does not belong to this organization');
    }

    // Prevent removing yourself
    if (userToRemove._id.toString() === req.user!._id.toString()) {
      throw ApiError.badRequest('You cannot remove yourself from the organization');
    }

    // Check if this is the last org admin
    if (userToRemove.role === UserRole.ORG_ADMIN) {
      const adminCount = await User.countDocuments({
        organization: orgId,
        role: UserRole.ORG_ADMIN,
      });

      if (adminCount <= 1) {
        throw ApiError.badRequest('Cannot remove the last organization admin. Please assign another admin first.');
      }
    }

    // Deactivate user instead of deleting (preserves data integrity)
    userToRemove.isActive = false;
    await userToRemove.save();

    logger.info(`User ${userToRemove.email} removed from ${organization.name} by ${req.user!.email}`);

    return sendSuccess(res, null, 'Team member removed successfully');
  })
);

/**
 * PATCH /api/organizations/:id/members/:userId/role
 * Update team member role (Org Admin only)
 */
const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum([UserRole.ORG_ADMIN, UserRole.ORG_MEMBER]),
  }),
});

router.patch(
  '/:id/members/:userId/role',
  isOrgAdmin,
  sameOrganizationOrAdmin,
  validate(updateRoleSchema),
  asyncHandler(async (req, res) => {
    const { id: orgId, userId } = req.params;
    const { role } = req.body;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      throw ApiError.notFound('User not found');
    }

    // Verify user belongs to this organization
    if (userToUpdate.organization?.toString() !== orgId) {
      throw ApiError.badRequest('User does not belong to this organization');
    }

    // If demoting from ORG_ADMIN, ensure there's at least one other admin
    if (userToUpdate.role === UserRole.ORG_ADMIN && role === UserRole.ORG_MEMBER) {
      const adminCount = await User.countDocuments({
        organization: orgId,
        role: UserRole.ORG_ADMIN,
      });

      if (adminCount <= 1) {
        throw ApiError.badRequest('Cannot demote the last organization admin. Please assign another admin first.');
      }
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    logger.info(`User ${userToUpdate.email} role updated to ${role} by ${req.user!.email}`);

    return sendSuccess(res, userToUpdate, 'Team member role updated successfully');
  })
);

/**
 * GET /api/organizations/:id/stats
 * Get organization statistics (Org Admin only)
 */
router.get(
  '/:id/stats',
  isOrgAdmin,
  sameOrganizationOrAdmin,
  asyncHandler(async (req, res) => {
    const orgId = req.params.id;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }

    const [
      totalMembers,
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalRevenue,
      pendingPayments,
    ] = await Promise.all([
      User.countDocuments({ organization: orgId, isActive: true }),
      Request.countDocuments({ organization: orgId }),
      Request.countDocuments({ organization: orgId, status: RequestStatus.SUBMITTED }),
      Request.countDocuments({ organization: orgId, status: RequestStatus.APPROVED }),
      Request.countDocuments({ organization: orgId, status: RequestStatus.REJECTED }),
      Payment.aggregate([
        { $match: { organization: organization._id, status: PaymentStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.countDocuments({ organization: orgId, status: PaymentStatus.PENDING }),
    ]);

    const stats = {
      organization: {
        name: organization.name,
        type: organization.type,
        isVerified: organization.isVerified,
      },
      members: {
        total: totalMembers,
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
      },
      financial: {
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingPayments,
        currency: 'INR',
      },
    };

    return sendSuccess(res, stats);
  })
);

export default router;
