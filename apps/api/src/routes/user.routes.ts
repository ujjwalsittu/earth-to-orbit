import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { z } from 'zod';
import User from '../models/User';
import { authenticate } from '../middleware/auth.middleware';
import ApiError from '../utils/api-error';
import { sendSuccess } from '../utils/response';
import { validate } from '../middleware/validation.middleware';
import asyncHandler from '../utils/async-handler';
import logger from '../utils/logger';

const router: ExpressRouter = Router();

// Validation schemas
const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
});

const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  }),
});

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw ApiError.unauthorized('Not authenticated');
    }

    const { firstName, lastName, email, phone } = req.body;

    // If email is being changed, check if it's already in use
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw ApiError.conflict('Email already in use');
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
          ...(phone !== undefined && { phone }),
        },
      },
      { new: true, runValidators: true }
    ).populate('organization');

    if (!updatedUser) {
      throw ApiError.notFound('User not found');
    }

    logger.info(`User profile updated: ${updatedUser.email}`);

    return sendSuccess(
      res,
      {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          role: updatedUser.role,
          organization: updatedUser.organization,
        },
      },
      'Profile updated successfully'
    );
  })
);

/**
 * PUT /api/users/password
 * Change current user's password
 */
router.put(
  '/password',
  authenticate,
  validate(updatePasswordSchema),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw ApiError.unauthorized('Not authenticated');
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password field
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    return sendSuccess(res, null, 'Password updated successfully');
  })
);

export default router;
