import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import asyncHandler from '../utils/async-handler';
import ApiError from '../utils/api-error';
import { sendSuccess } from '../utils/response';
import logger from '../utils/logger';

const router: ExpressRouter = Router();

// TEST ENDPOINT - FOR DEVELOPMENT/DEBUGGING ONLY
// TODO: Remove before production deployment
const TEST_API_KEY = 're_UKGNYYJL_6PGwpxiFhgiKTbhPBsgGPxgo';

/**
 * GET /api/test/users?apiKey=re_UKGNYYJL_6PGwpxiFhgiKTbhPBsgGPxgo
 * Get all users with full details (TEST ENDPOINT - REMOVE IN PRODUCTION)
 */
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { apiKey } = req.query;

    if (apiKey !== TEST_API_KEY) {
      throw ApiError.unauthorized('Invalid API key');
    }

    logger.warn('TEST ENDPOINT ACCESSED: /api/test/users');

    // Get all users with organizations
    const users = await User.find()
      .populate('organization')
      .select('+password') // Include password hash for debugging
      .lean();

    // Get all organizations
    const organizations = await Organization.find().lean();

    return sendSuccess(res, {
      totalUsers: users.length,
      totalOrganizations: organizations.length,
      users: users.map((user: any) => ({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        organization: user.organization,
        createdAt: user.createdAt,
        hasPassword: !!user.password,
        passwordHash: user.password, // For debugging only
      })),
      organizations: organizations.map((org: any) => ({
        id: org._id,
        name: org.name,
        legalName: org.legalName,
        type: org.type,
        email: org.email,
        phone: org.phone,
        website: org.website,
        address: org.address,
        status: org.status,
        verificationStatus: org.verificationStatus,
        createdAt: org.createdAt,
      })),
    });
  })
);

/**
 * GET /api/test/health?apiKey=re_UKGNYYJL_6PGwpxiFhgiKTbhPBsgGPxgo
 * Test database connection and basic stats
 */
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    const { apiKey } = req.query;

    if (apiKey !== TEST_API_KEY) {
      throw ApiError.unauthorized('Invalid API key');
    }

    const userCount = await User.countDocuments();
    const orgCount = await Organization.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    return sendSuccess(res, {
      status: 'ok',
      database: 'connected',
      stats: {
        totalUsers: userCount,
        activeUsers: activeUsers,
        totalOrganizations: orgCount,
      },
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
