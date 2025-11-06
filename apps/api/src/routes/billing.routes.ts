import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import Invoice from '../models/Invoice';
import { authenticate } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import asyncHandler from '../utils/async-handler';
import ApiError from '../utils/api-error';
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/billing/invoices
 * Get all invoices for current user/organization
 */
router.get(
  '/invoices',
  asyncHandler(async (req, res) => {
    const { status, page = '1', limit = '20' } = req.query;

    const query: any = {};

    // Platform admins can see all invoices
    if (req.user!.role === UserRole.PLATFORM_ADMIN) {
      // No filter
    } else {
      // Org members can only see their organization's invoices
      query.organization = req.user!.organization;
    }

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('organization', 'name legalName')
        .populate('request', 'requestNumber title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Invoice.countDocuments(query),
    ]);

    return sendPaginatedSuccess(res, invoices, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  })
);

/**
 * GET /api/billing/invoices/:id
 * Get invoice by ID
 */
router.get(
  '/invoices/:id',
  asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id)
      .populate('organization')
      .populate('request');

    if (!invoice) {
      throw ApiError.notFound('Invoice not found');
    }

    // Check access
    if (req.user!.role !== UserRole.PLATFORM_ADMIN) {
      if (invoice.organization.toString() !== req.user!.organization?.toString()) {
        throw ApiError.forbidden('You do not have access to this invoice');
      }
    }

    return sendSuccess(res, invoice);
  })
);

/**
 * GET /api/billing/invoices/request/:requestId
 * Get invoice by request ID
 */
router.get(
  '/invoices/request/:requestId',
  asyncHandler(async (req, res) => {
    const invoice = await Invoice.findOne({ request: req.params.requestId })
      .populate('organization')
      .populate('request');

    if (!invoice) {
      throw ApiError.notFound('Invoice not found for this request');
    }

    // Check access
    if (req.user!.role !== UserRole.PLATFORM_ADMIN) {
      if (invoice.organization.toString() !== req.user!.organization?.toString()) {
        throw ApiError.forbidden('You do not have access to this invoice');
      }
    }

    return sendSuccess(res, invoice);
  })
);

export default router;
