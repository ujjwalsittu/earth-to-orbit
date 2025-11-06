import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User, { UserRole } from '../models/User';
import Organization from '../models/Organization';
import { env } from '../config/env';
import asyncHandler from '../utils/async-handler';
import ApiError from '../utils/api-error';
import { sendSuccess } from '../utils/response';
import { validate } from '../middleware/validation.middleware';
import { authLimiter } from '../middleware/rate-limit.middleware';
import { sendRegistrationEmail } from '../services/email.service';
import logger from '../utils/logger';

const router: ExpressRouter = Router();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
    organization: z.object({
      name: z.string().min(1),
      legalName: z.string().min(1),
      type: z.enum(['startup', 'research', 'academic', 'government', 'corporate']),
      registrationNumber: z.string().optional(),
      gst: z.string().optional(),
      pan: z.string().optional(),
      email: z.string().email(),
      phone: z.string(),
      website: z.string().url().optional(),
      address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        country: z.string().default('India'),
        postalCode: z.string(),
      }),
    }),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

// Helper to generate tokens
const generateTokens = (userId: string, email: string, role: string) => {
  const accessToken = jwt.sign({ userId, email, role }, env.JWT_SECRET, {
    expiresIn: '1h',
  });

  const refreshToken = jwt.sign({ userId, email, role }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

/**
 * POST /api/auth/register
 * Register new organization with admin user
 */
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, phone, organization: orgData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('User with this email already exists');
    }

    // Check if organization already exists
    const existingOrg = await Organization.findOne({
      $or: [{ email: orgData.email }, { name: orgData.name }],
    });
    if (existingOrg) {
      throw ApiError.conflict('Organization already exists');
    }

    // Create organization
    const organization = await Organization.create(orgData);

    // Create admin user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      role: UserRole.ORG_ADMIN,
      organization: organization._id,
    });

    // Send welcome email
    try {
      await sendRegistrationEmail(email, firstName, organization.name);
    } catch (error) {
      logger.error('Failed to send registration email:', error);
      // Don't fail registration if email fails
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
      user.email,
      user.role
    );

    logger.info(`New organization registered: ${organization.name}`);

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: {
            id: organization._id,
            name: organization.name,
          },
        },
        accessToken,
        refreshToken,
      },
      'Registration successful',
      201
    );
  })
);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password').populate('organization');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
      user.email,
      user.role
    );

    logger.info(`User logged in: ${user.email}`);

    return sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organization: user.organization,
      },
      accessToken,
      refreshToken,
    });
  })
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };

      // Verify user still exists and is active
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw ApiError.unauthorized('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = generateTokens(user._id.toString(), user.email, user.role);

      return sendSuccess(res, tokens);
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }
  })
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw ApiError.unauthorized('Not authenticated');
    }

    return sendSuccess(res, {
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phone: req.user.phone,
        role: req.user.role,
        organization: req.user.organization,
        lastLogin: req.user.lastLogin,
      },
    });
  })
);

export default router;
