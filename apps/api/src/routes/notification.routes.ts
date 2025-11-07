import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import Notification from '../models/Notification';
import { authenticate } from '../middleware/auth.middleware';
import asyncHandler from '../utils/async-handler';
import ApiError from '../utils/api-error';
import { sendSuccess } from '../utils/response';
import { markAsRead, markAllAsRead, getUnreadCount } from '../services/notification.service';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/notifications
 * Get all notifications for current user
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { limit = '50' } = req.query;

    const notifications = await Notification.find({ user: req.user!._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string, 10));

    return sendSuccess(res, notifications);
  })
);

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get(
  '/unread-count',
  asyncHandler(async (req, res) => {
    const count = await getUnreadCount(req.user!._id.toString());
    return sendSuccess(res, { count });
  })
);

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    // Check access
    if (notification.user.toString() !== req.user!._id.toString()) {
      throw ApiError.forbidden('You do not have access to this notification');
    }

    const updated = await markAsRead(req.params.id);

    return sendSuccess(res, updated, 'Notification marked as read');
  })
);

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read
 */
router.post(
  '/mark-all-read',
  asyncHandler(async (req, res) => {
    await markAllAsRead(req.user!._id.toString());
    return sendSuccess(res, null, 'All notifications marked as read');
  })
);

export default router;
