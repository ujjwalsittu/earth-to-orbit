import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { successResponse } from '../utils/response';
import { authenticate } from '../middleware/auth.middleware';
import { SchedulingService } from '../services/scheduling.service';

const router = Router();
const schedulingService = new SchedulingService();

/**
 * POST /api/availability/check
 */
router.post(
  '/check',
  authenticate,
  asyncHandler(async (req, res) => {
    const { labId, siteId, start, end } = req.body;
    const result = await schedulingService.checkAvailability(
      labId,
      siteId,
      new Date(start),
      new Date(end)
    );
    return successResponse(res, result);
  })
);

/**
 * GET /api/availability/calendar
 */
router.get(
  '/calendar',
  authenticate,
  asyncHandler(async (req, res) => {
    const { labId, siteId, startDate, endDate } = req.query;
    const bookings = await schedulingService.getCalendarView(
      labId as string,
      siteId as string,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    return successResponse(res, { bookings });
  })
);

export default router;
