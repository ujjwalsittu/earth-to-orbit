import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { z } from 'zod';
import asyncHandler from '../utils/async-handler';
import ApiError from '../utils/api-error';
import { sendSuccess } from '../utils/response';
import { validate } from '../middleware/validation.middleware';
import { optionalAuthenticate } from '../middleware/auth.middleware';
import { getAvailability } from '../services/scheduling.service';

const router: ExpressRouter = Router();

// Apply optional authentication
router.use(optionalAuthenticate);

const checkAvailabilitySchema = z.object({
  query: z.object({
    itemId: z.string(),
    itemType: z.enum(['lab', 'component']),
    startDate: z.string(),
    endDate: z.string(),
  }),
});

/**
 * GET /api/availability/check
 * Check availability for an item
 */
router.get(
  '/check',
  validate(checkAvailabilitySchema),
  asyncHandler(async (req, res) => {
    const { itemId, itemType, startDate, endDate } = req.query;

    const availability = await getAvailability(
      itemId as string,
      itemType as 'lab' | 'component',
      new Date(startDate as string),
      new Date(endDate as string)
    );

    return sendSuccess(res, availability);
  })
);

export default router;
