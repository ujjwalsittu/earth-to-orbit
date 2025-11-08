import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { z } from 'zod';
import Request, { RequestStatus } from '../models/Request';
import Lab from '../models/Lab';
import Component from '../models/Component';
import Site from '../models/Site';
import Staff from '../models/Staff';
import { authenticate } from '../middleware/auth.middleware';
import { authorize, isOrgAdmin } from '../middleware/rbac.middleware';
import { UserRole } from '../models/User';
import asyncHandler from '../utils/async-handler';
import ApiError from '../utils/api-error';
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';
import { validate } from '../middleware/validation.middleware';
import { generateRequestNumber } from '../utils/generate-number';
import {
  validateTimeSlot,
  checkMachineryConflicts,
  isLabAvailable,
  findAlternativeSlots,
  checkComponentAvailability,
  calculateHours,
} from '../services/scheduling.service';
import logger from '../utils/logger';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

const createRequestSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    machineryItems: z
      .array(
        z.object({
          lab: z.string(),
          site: z.string(),
          startTime: z.string().datetime(),
          endTime: z.string().datetime(),
          notes: z.string().optional(),
        })
      )
      .optional(),
    components: z
      .array(
        z.object({
          component: z.string(),
          quantity: z.number().min(1),
          startDate: z.string().datetime().optional(),
          endDate: z.string().datetime().optional(),
        })
      )
      .optional(),
    assistanceItems: z
      .array(
        z.object({
          staff: z.string().optional(),
          hours: z.number().min(0.5),
          notes: z.string().optional(),
        })
      )
      .optional(),
    projectDetails: z
      .object({
        projectName: z.string().optional(),
        projectDescription: z.string().optional(),
        missionObjective: z.string().optional(),
      })
      .optional(),
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
        .populate('machineryItems.lab')
        .populate('machineryItems.site')
        .populate('components.component')
        .populate('assistanceItems.staff', 'firstName lastName ratePerHour')
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
      .populate('machineryItems.lab')
      .populate('machineryItems.site')
      .populate('components.component')
      .populate('assistanceItems.staff', 'firstName lastName ratePerHour')
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
    const { title, description, machineryItems = [], components = [], assistanceItems = [], projectDetails } = req.body;

    // Ensure at least one item type is provided
    if (machineryItems.length === 0 && components.length === 0 && assistanceItems.length === 0) {
      throw ApiError.badRequest('Request must contain at least one item (machinery, component, or assistance)');
    }

    // Process machinery items (labs)
    const processedMachineryItems = [];
    let machinerySubtotal = 0;

    for (const item of machineryItems) {
      const startTime = new Date(item.startTime);
      const endTime = new Date(item.endTime);

      // Validate time slot against lab's constraints
      await validateTimeSlot(item.lab, startTime, endTime);

      // Get lab details
      const lab = await Lab.findById(item.lab);
      if (!lab || !lab.isActive) {
        throw ApiError.notFound(`Lab not found: ${item.lab}`);
      }

      // Verify site exists
      const site = await Site.findById(item.site);
      if (!site) {
        throw ApiError.notFound(`Site not found: ${item.site}`);
      }

      // Check for time-based conflicts
      const conflicts = await checkMachineryConflicts(
        item.lab,
        item.site,
        startTime,
        endTime
      );

      if (conflicts.length > 0) {
        throw ApiError.conflict(
          `Lab is already booked during this time slot. Conflict with request: ${conflicts[0].requestNumber}`
        );
      }

      // Calculate duration and pricing
      const durationHours = calculateHours(startTime, endTime);
      const rateSnapshot = lab.ratePerHour;
      const itemSubtotal = durationHours * rateSnapshot;

      machinerySubtotal += itemSubtotal;

      processedMachineryItems.push({
        lab: item.lab,
        site: item.site,
        startTime,
        endTime,
        durationHours,
        rateSnapshot,
        subtotal: itemSubtotal,
        notes: item.notes,
      });
    }

    // Process component items
    const processedComponents = [];
    let componentsSubtotal = 0;

    for (const item of components) {
      const component = await Component.findById(item.component);
      if (!component || !component.isActive) {
        throw ApiError.notFound(`Component not found: ${item.component}`);
      }

      // Check availability
      const availability = await checkComponentAvailability(item.component, item.quantity);
      if (!availability.available) {
        throw ApiError.badRequest(
          `Insufficient quantity available. Available: ${availability.availableQuantity}, Requested: ${item.quantity}`
        );
      }

      // Calculate rental duration if dates are provided
      let rentalDays = 1; // Default to 1 day for purchase/single-day rental
      let startDate, endDate;
      if (item.startDate && item.endDate) {
        startDate = new Date(item.startDate);
        endDate = new Date(item.endDate);
        const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        rentalDays = Math.max(1, Math.ceil(hours / 24));
      }

      // Use rentalRatePerDay if available, fallback to unitPrice
      const priceSnapshot = component.rentalRatePerDay || component.unitPrice;
      const itemSubtotal = priceSnapshot * item.quantity * rentalDays;

      componentsSubtotal += itemSubtotal;

      processedComponents.push({
        component: item.component,
        quantity: item.quantity,
        startDate,
        endDate,
        rentalDays,
        priceSnapshot,
        subtotal: itemSubtotal,
      });
    }

    // Process assistance items
    const processedAssistanceItems = [];
    let assistanceSubtotal = 0;

    for (const item of assistanceItems) {
      let rateSnapshot = 500; // Default rate per hour in INR

      // If staff is specified, get their rate
      if (item.staff) {
        const staff = await Staff.findById(item.staff);
        if (!staff) {
          throw ApiError.notFound(`Staff member not found: ${item.staff}`);
        }
        rateSnapshot = staff.ratePerHour || 500;
      }

      const itemSubtotal = item.hours * rateSnapshot;
      assistanceSubtotal += itemSubtotal;

      processedAssistanceItems.push({
        staff: item.staff || undefined,
        hours: item.hours,
        rateSnapshot,
        subtotal: itemSubtotal,
        notes: item.notes,
      });
    }

    // Calculate totals
    const subtotal = machinerySubtotal + componentsSubtotal + assistanceSubtotal;
    const taxRate = 18; // 18% GST
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
      machineryItems: processedMachineryItems,
      components: processedComponents,
      assistanceItems: processedAssistanceItems,
      status: RequestStatus.SUBMITTED,
      machinerySubtotal,
      componentsSubtotal,
      assistanceSubtotal,
      subtotal,
      taxRate,
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
 * Request booking extension with alternative suggestions
 */
router.post(
  '/:id/extension',
  asyncHandler(async (req, res) => {
    const { additionalHours, reason } = req.body;

    if (!additionalHours || additionalHours <= 0) {
      throw ApiError.badRequest('Additional hours must be greater than 0');
    }

    const request = await Request.findById(req.params.id)
      .populate('machineryItems.lab')
      .populate('machineryItems.site');

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

    // Check if request has machinery items
    if (!request.machineryItems || request.machineryItems.length === 0) {
      throw ApiError.badRequest('Cannot extend request without machinery bookings');
    }

    // Check conflicts for each machinery item
    const conflicts = [];
    const alternatives = [];
    let priceDelta = 0;

    for (const item of request.machineryItems) {
      const currentEndTime = new Date(item.endTime);
      const requestedEndTime = new Date(
        currentEndTime.getTime() + additionalHours * 60 * 60 * 1000
      );

      // Validate the extended time slot
      try {
        await validateTimeSlot(
          item.lab._id.toString(),
          currentEndTime,
          requestedEndTime
        );
      } catch (error: any) {
        return sendSuccess(res, {
          available: false,
          reason: error.message,
          alternatives: [],
        });
      }

      // Check for time-based conflicts
      const itemConflicts = await checkMachineryConflicts(
        item.lab._id.toString(),
        item.site._id.toString(),
        currentEndTime,
        requestedEndTime,
        request._id.toString()
      );

      if (itemConflicts.length > 0) {
        conflicts.push(...itemConflicts);

        // Find alternative slots
        const altSlots = await findAlternativeSlots(
          item.lab._id.toString(),
          item.site._id.toString(),
          requestedEndTime,
          additionalHours,
          5
        );

        const lab = item.lab as any; // Populated lab document
        alternatives.push({
          labId: lab._id.toString(),
          labName: lab.name,
          alternatives: altSlots,
        });
      }

      // Calculate price delta
      const lab = item.lab as any;
      priceDelta += additionalHours * (lab.ratePerHour || item.rateSnapshot);
    }

    // If conflicts exist, return alternatives
    if (conflicts.length > 0) {
      return sendSuccess(res, {
        available: false,
        conflicts,
        alternatives,
        priceDelta: priceDelta * 1.18, // Include 18% GST
        message:
          'The requested extension is not available due to conflicts. Please review the suggested alternatives.',
      });
    }

    // No conflicts - create extension request
    if (!request.extensionRequests) {
      request.extensionRequests = [];
    }

    // Calculate new end time for first machinery item (representative)
    const firstMachineryItem = request.machineryItems[0];
    const requestedEndTime = new Date(
      new Date(firstMachineryItem.endTime).getTime() + additionalHours * 60 * 60 * 1000
    );

    request.extensionRequests.push({
      requestedHours: additionalHours,
      requestedEndTime,
      reason,
      status: 'pending',
      requestedAt: new Date(),
      priceDelta: priceDelta * 1.18, // Include GST
    } as any);

    await request.save();

    logger.info(
      `Extension request created for ${request.requestNumber}: ${additionalHours} additional hours`
    );

    return sendSuccess(res, {
      available: true,
      request,
      priceDelta: priceDelta * 1.18,
      message: 'Extension request submitted successfully for admin approval',
    });
  })
);

export default router;
