import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { z } from 'zod';
import Request, { RequestStatus } from '../models/Request';
import Lab from '../models/Lab';
import Component from '../models/Component';
import { authenticate } from '../middleware/auth.middleware';
import { authorize, isOrgAdmin } from '../middleware/rbac.middleware';
import { UserRole } from '../models/User';
import asyncHandler from '../utils/async-handler';
import ApiError from '../utils/api-error';
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';
import { validate } from '../middleware/validation.middleware';
import { generateRequestNumber } from '../utils/generate-number';
import { checkBookingConflicts, calculateDays, validateBookingDates } from '../services/scheduling.service';
import logger from '../utils/logger';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

const createRequestSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    items: z.array(
      z.object({
        itemType: z.enum(['lab', 'component']),
        item: z.string(),
        quantity: z.number().min(1),
        startDate: z.string(),
        endDate: z.string(),
      })
    ).min(1),
    projectDetails: z.object({
      projectName: z.string().optional(),
      projectDescription: z.string().optional(),
      missionObjective: z.string().optional(),
    }).optional(),
  }),
});

/**
 * GET /api/requests
 * Get all requests for current user/organization
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, page = '1', limit = '20' } = req.query;

    const query: any = {};

    // Platform admins can see all requests
    if (req.user!.role === UserRole.PLATFORM_ADMIN) {
      // No filter
    } else {
      // Org members can only see their organization's requests
      query.organization = req.user!.organization;
    }

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      Request.find(query)
        .populate('user', 'firstName lastName email')
        .populate('organization', 'name')
        .populate('items.item')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Request.countDocuments(query),
    ]);

    return sendPaginatedSuccess(res, requests, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  })
);

/**
 * GET /api/requests/:id
 * Get request by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.id)
      .populate('user', 'firstName lastName email phone')
      .populate('organization')
      .populate('items.item')
      .populate('reviewedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!request) {
      throw ApiError.notFound('Request not found');
    }

    // Check access
    if (req.user!.role !== UserRole.PLATFORM_ADMIN) {
      if (request.organization.toString() !== req.user!.organization?.toString()) {
        throw ApiError.forbidden('You do not have access to this request');
      }
    }

    return sendSuccess(res, request);
  })
);

/**
 * POST /api/requests
 * Create new booking request
 */
router.post(
  '/',
  validate(createRequestSchema),
  asyncHandler(async (req, res) => {
    const { title, description, items, projectDetails } = req.body;

    // Validate and process items
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);

      // Validate dates
      validateBookingDates(startDate, endDate);

      // Calculate days
      const days = calculateDays(startDate, endDate);

      // Get item details
      let itemDoc, pricePerDay;

      if (item.itemType === 'lab') {
        itemDoc = await Lab.findById(item.item);
        if (!itemDoc || !itemDoc.isActive) {
          throw ApiError.notFound(`Lab not found: ${item.item}`);
        }
        pricePerDay = itemDoc.pricePerDay;

        // Check for conflicts
        const conflicts = await checkBookingConflicts(
          item.item,
          'lab',
          startDate,
          endDate
        );

        if (conflicts.length > 0) {
          throw ApiError.conflict(
            `Lab is already booked during this period. Conflict with request: ${conflicts[0].requestNumber}`
          );
        }
      } else {
        itemDoc = await Component.findById(item.item);
        if (!itemDoc || !itemDoc.isActive) {
          throw ApiError.notFound(`Component not found: ${item.item}`);
        }
        pricePerDay = itemDoc.pricePerDay;

        // Check availability
        if (itemDoc.availableQuantity < item.quantity) {
          throw ApiError.badRequest(
            `Insufficient quantity available. Available: ${itemDoc.availableQuantity}, Requested: ${item.quantity}`
          );
        }

        // Check for conflicts
        const conflicts = await checkBookingConflicts(
          item.item,
          'component',
          startDate,
          endDate,
          item.quantity
        );

        if (conflicts.length > 0) {
          throw ApiError.conflict(
            `Insufficient quantity available during this period. Conflict with request: ${conflicts[0].requestNumber}`
          );
        }
      }

      const itemSubtotal = pricePerDay * item.quantity * days;
      subtotal += itemSubtotal;

      processedItems.push({
        itemType: item.itemType,
        // Explicitly store the model name for population
        itemModel: item.itemType === 'lab' ? 'Lab' : 'Component',
        item: item.item,
        quantity: item.quantity,
        startDate,
        endDate,
        days,
        pricePerDay,
        subtotal: itemSubtotal,
      });
    }

    // Calculate tax (18% GST)
    const taxRate = 18;
    const tax = (subtotal * taxRate) / 100;
    const total = subtotal + tax;

    // Get next request number
    const lastRequest = await Request.findOne().sort({ createdAt: -1 });
    const sequenceNumber = lastRequest
      ? parseInt(lastRequest.requestNumber.split('-')[2]) + 1
      : 1;

    // Create request
    const request = await Request.create({
      requestNumber: generateRequestNumber(sequenceNumber),
      title,
      description,
      organization: req.user!.organization,
      user: req.user!._id,
      items: processedItems,
      status: RequestStatus.SUBMITTED,
      subtotal,
      tax,
      total,
      currency: 'INR',
      projectDetails,
    });

    logger.info(`Request ${request.requestNumber} created by ${req.user!.email}`);

    return sendSuccess(res, request, 'Request created successfully', 201);
  })
);

/**
 * PATCH /api/requests/:id
 * Update request (only if draft or rejected)
 */
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.id);

    if (!request) {
      throw ApiError.notFound('Request not found');
    }

    // Check access
    if (req.user!.role !== UserRole.PLATFORM_ADMIN) {
      if (request.organization.toString() !== req.user!.organization?.toString()) {
        throw ApiError.forbidden('You do not have access to this request');
      }
    }

    // Only allow updates for draft or rejected requests
    if (![RequestStatus.DRAFT, RequestStatus.REJECTED].includes(request.status)) {
      throw ApiError.badRequest('Only draft or rejected requests can be updated');
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'projectDetails', 'notes'];
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        (request as any)[key] = req.body[key];
      }
    });

    await request.save();

    logger.info(`Request ${request.requestNumber} updated`);

    return sendSuccess(res, request, 'Request updated successfully');
  })
);

/**
 * DELETE /api/requests/:id
 * Cancel request
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.id);

    if (!request) {
      throw ApiError.notFound('Request not found');
    }

    // Check access
    if (req.user!.role !== UserRole.PLATFORM_ADMIN) {
      if (request.organization.toString() !== req.user!.organization?.toString()) {
        throw ApiError.forbidden('You do not have access to this request');
      }
    }

    // Only allow cancellation if not completed
    if (request.status === RequestStatus.COMPLETED) {
      throw ApiError.badRequest('Completed requests cannot be cancelled');
    }

    request.status = RequestStatus.CANCELLED;
    await request.save();

    logger.info(`Request ${request.requestNumber} cancelled`);

    return sendSuccess(res, null, 'Request cancelled successfully');
  })
);

/**
 * POST /api/requests/:id/extension
 * Request booking extension
 */
router.post(
  '/:id/extension',
  asyncHandler(async (req, res) => {
    const { requestedEndDate, reason } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      throw ApiError.notFound('Request not found');
    }

    // Check access
    if (req.user!.role !== UserRole.PLATFORM_ADMIN) {
      if (request.organization.toString() !== req.user!.organization?.toString()) {
        throw ApiError.forbidden('You do not have access to this request');
      }
    }

    // Only allow extensions for approved or in-progress requests
    if (![RequestStatus.APPROVED, RequestStatus.IN_PROGRESS].includes(request.status)) {
      throw ApiError.badRequest('Only approved or in-progress requests can be extended');
    }

    if (!request.extensionRequests) {
      request.extensionRequests = [];
    }

    request.extensionRequests.push({
      requestedEndDate: new Date(requestedEndDate),
      reason,
      status: 'pending',
      requestedAt: new Date(),
    } as any);

    await request.save();

    logger.info(`Extension requested for ${request.requestNumber}`);

    return sendSuccess(res, request, 'Extension request submitted successfully');
  })
);

export default router;
