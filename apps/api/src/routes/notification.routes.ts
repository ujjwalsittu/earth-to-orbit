import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { successResponse } from '../utils/response';
import { authenticate } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';

const router = Router();
const notificationService = new NotificationService();

/**
 * GET /api/notifications
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const authReq = req as any;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const result = await notificationService.getUserNotifications(
      authReq.user.id,
      Number(page),
      Number(limit),
      unreadOnly === 'true'
    );
    return successResponse(res, result);
  })
);

/**
 * PUT /api/notifications/:id/read
 */
router.put(
  '/:id/read',
  authenticate,
  asyncHandler(async (req, res) => {
    await notificationService.markAsRead(req.params.id);
    return successResponse(res, null, 'Notification marked as read');
  })
);

/**
 * PUT /api/notifications/read-all
 */
router.put(
  '/read-all',
  authenticate,
  asyncHandler(async (req, res) => {
    const authReq = req as any;
    await notificationService.markAllAsRead(authReq.user.id);
    return successResponse(res, null, 'All notifications marked as read');
  })
);

export default router;
