import { Router } from 'express';
import { Request as RequestDoc } from '../models/Request';
import { Lab } from '../models/Lab';
import { Component } from '../models/Component';
import { Invoice } from '../models/Invoice';
import { RequestStatus, UserRole, requestCreateSchema } from '@e2o/types';
import { asyncHandler } from '../utils/async-handler';
import { successResponse } from '../utils/response';
import { authenticate } from '../middleware/auth.middleware';
import { requirePlatformAdmin } from '../middleware/rbac.middleware';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/api-error';
import { generateSequentialNumber } from '../utils/generate-number';
import { BillingService } from '../services/billing.service';
import { SchedulingService } from '../services/scheduling.service';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';
import { validateBody } from '../middleware/validation.middleware';

const router = Router();
const billingService = new BillingService();
const schedulingService = new SchedulingService();
const notificationService = new NotificationService();
const emailService = new EmailService();

/**
 * POST /api/requests
 * Create new request (draft)
 */
router.post(
  '/',
  authenticate,
  validateBody(requestCreateSchema),
  asyncHandler(async (req, res) => {
    const authReq = req as any;
    const userId = authReq.user.id;
    const organizationId = authReq.user.organizationId;

    // Get last request number
    const lastRequest = await RequestDoc.findOne().sort({ createdAt: -1 });
    const requestNumber = generateSequentialNumber('REQ', lastRequest?.requestNumber);

    // Fetch and snapshot rates
    const machineryItems = await Promise.all(
      req.body.machineryItems.map(async (item: any) => {
        const lab = await Lab.findById(item.labId);
        if (!lab) throw new NotFoundError(`Lab ${item.labId} not found`);
        return {
          ...item,
          rateSnapshot: lab.ratePerHour,
        };
      })
    );

    const componentItems = await Promise.all(
      req.body.componentItems.map(async (item: any) => {
        const component = await Component.findById(item.componentId);
        if (!component) throw new NotFoundError(`Component ${item.componentId} not found`);
        return {
          ...item,
          priceSnapshot: item.isRental ? component.rentalRatePerDay || 0 : component.pricePerUnit,
        };
      })
    );

    const assistanceItems = req.body.assistanceItems.map((item: any) => ({
      ...item,
      rateSnapshot: 0, // Will be set when staff assigned
    }));

    // Create request
    const request = new RequestDoc({
      organizationId,
      requestedBy: userId,
      requestNumber,
      title: req.body.title,
      description: req.body.description,
      machineryItems,
      componentItems,
      assistanceItems,
      attachments: req.body.attachments || [],
      status: RequestStatus.DRAFT,
    });

    // Calculate pricing
    request.totals = billingService.calculateRequestPricing(request);

    await request.save();

    return successResponse(res, { request }, 'Request created', 201);
  })
);

/**
 * POST /api/requests/:id/submit
 * Submit request for review
 */
router.post(
  '/:id/submit',
  authenticate,
  asyncHandler(async (req, res) => {
    const authReq = req as any;
    const request = await RequestDoc.findById(req.params.id);

    if (!request) {
      throw new NotFoundError('Request not found');
    }

    // Check ownership or admin
    if (
      request.organizationId.toString() !== authReq.user.organizationId &&
      authReq.user.role !== UserRole.PLATFORM_ADMIN
    ) {
      throw new ForbiddenError('Access denied');
    }

    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestError('Request already submitted');
    }

    // Check availability for all machinery items
    for (const item of request.machineryItems) {
      const availability = await schedulingService.checkAvailability(
        item.labId.toString(),
        item.siteId.toString(),
        item.requestedStart,
        item.requestedEnd
      );

      if (!availability.isAvailable) {
        throw new BadRequestError(
          `Requested time slot for ${item.labId} is not available. Please check availability and try again.`
        );
      }
    }

    request.status = RequestStatus.SUBMITTED;
    request.submittedAt = new Date();
    await request.save();

    // Notify admins
    await notificationService.notifyPlatformAdmins(
      'REQUEST_SUBMITTED' as any,
      `New Request: ${request.requestNumber}`,
      `${request.title} submitted by organization`,
      `/admin/requests/${request._id}`
    );

    return successResponse(res, { request }, 'Request submitted');
  })
);

/**
 * GET /api/requests
 * List user's requests
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const authReq = req as any;
    const { page = 1, limit = 20, status } = req.query;

    const query: any = {};

    // Filter by organization unless platform admin
    if (authReq.user.role !== UserRole.PLATFORM_ADMIN) {
      query.organizationId = authReq.user.organizationId;
    }

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [requests, total] = await Promise.all([
      RequestDoc.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('organizationId', 'name')
        .populate('requestedBy', 'firstName lastName email'),
      RequestDoc.countDocuments(query),
    ]);

    return successResponse(res, {
      requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  })
);

/**
 * GET /api/requests/:id
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const authReq = req as any;
    const request = await RequestDoc.findById(req.params.id)
      .populate('organizationId')
      .populate('requestedBy', 'firstName lastName email')
      .populate('machineryItems.labId')
      .populate('machineryItems.siteId')
      .populate('componentItems.componentId')
      .populate('assignedStaffIds');

    if (!request) {
      throw new NotFoundError('Request not found');
    }

    // Check access
    if (
      request.organizationId._id.toString() !== authReq.user.organizationId &&
      authReq.user.role !== UserRole.PLATFORM_ADMIN
    ) {
      throw new ForbiddenError('Access denied');
    }

    // Get invoices
    const invoices = await Invoice.find({ requestId: request._id }).sort({ createdAt: -1 });

    return successResponse(res, { request, invoices });
  })
);

/**
 * POST /api/requests/:id/approve (Admin)
 */
router.post(
  '/:id/approve',
  authenticate,
  requirePlatformAdmin,
  asyncHandler(async (req, res) => {
    const authReq = req as any;
    const { scheduledStart, scheduledEnd, assignedStaffIds, internalNotes } = req.body;

    const request = await RequestDoc.findById(req.params.id).populate('organizationId');
    if (!request) {
      throw new NotFoundError('Request not found');
    }

    if (request.status !== RequestStatus.SUBMITTED && request.status !== RequestStatus.UNDER_REVIEW) {
      throw new BadRequestError('Request cannot be approved in current status');
    }

    // Update machinery items with scheduled times
    request.machineryItems = request.machineryItems.map((item) => ({
      ...item,
      scheduledStart: scheduledStart || item.requestedStart,
      scheduledEnd: scheduledEnd || item.requestedEnd,
    }));

    request.status = RequestStatus.APPROVED;
    request.approvedAt = new Date();
    request.approvedBy = authReq.user.id;
    request.scheduledStart = scheduledStart;
    request.scheduledEnd = scheduledEnd;
    request.assignedStaffIds = assignedStaffIds || [];
    request.internalNotes = internalNotes;

    await request.save();

    // Generate invoice
    const invoice = await billingService.generateInvoiceFromRequest(request._id.toString());

    // Notify customer
    await notificationService.notifyOrgAdmins(
      request.organizationId._id.toString(),
      'REQUEST_APPROVED' as any,
      `Request Approved: ${request.requestNumber}`,
      `Your request has been approved. Invoice: ${invoice.invoiceNumber}`,
      `/dashboard/requests/${request._id}`
    );

    return successResponse(res, { request, invoice }, 'Request approved');
  })
);

export default router;
