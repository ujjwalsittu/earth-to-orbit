import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { UserRole, userLoginSchema, userCreateSchema, organizationCreateSchema } from '@e2o/types';
import { asyncHandler } from '../utils/async-handler';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/api-error';
import { successResponse } from '../utils/response';
import { generateToken, generateRefreshToken, authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rate-limit.middleware';
import { validateBody } from '../middleware/validation.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register new organization and admin user
 */
router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { organization, user } = req.body;

    // Validate
    const orgData = organizationCreateSchema.parse(organization);
    const userData = userCreateSchema.omit({ organizationId: true }).parse(user);

    // Check if email exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Check if organization exists
    const existingOrg = await Organization.findOne({
      registrationNumber: orgData.registrationNumber,
    });
    if (existingOrg) {
      throw new ConflictError('Organization already registered');
    }

    // Create organization
    const newOrg = new Organization({
      ...orgData,
      isActive: true,
      isVerified: false,
    });
    await newOrg.save();

    // Create admin user
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new User({
      ...userData,
      passwordHash: hashedPassword,
      organizationId: newOrg._id,
      role: UserRole.ORG_ADMIN,
      isActive: true,
      emailVerified: false,
    });
    await newUser.save();

    // Generate tokens
    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      organizationId: newOrg._id.toString(),
    });

    const refreshToken = generateRefreshToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      organizationId: newOrg._id.toString(),
    });

    return successResponse(
      res,
      {
        user: {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          organizationId: newOrg._id,
        },
        organization: {
          id: newOrg._id,
          name: newOrg.name,
        },
        token,
        refreshToken,
      },
      'Registration successful',
      201
    );
  })
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  authLimiter,
  validateBody(userLoginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: user.organizationId.toString(),
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: user.organizationId.toString(),
    });

    return successResponse(res, {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
      token,
      refreshToken,
    });
  })
);

/**
 * GET /api/auth/me
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const authReq = req as any;
    const user = await User.findById(authReq.user.id)
      .populate('organizationId')
      .select('-passwordHash');

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return successResponse(res, { user });
  })
);

/**
 * POST /api/auth/logout
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    // In a more sophisticated setup, you'd invalidate the token in Redis/DB
    return successResponse(res, null, 'Logout successful');
  })
);

export default router;
