import { Router } from 'express';
import { z } from 'zod';
import Request, { RequestStatus } from '../models/Request';
import User from '../models/User';
import Organization from '../models/Organization';
import Payment, { PaymentStatus } from '../models/Payment';
import { authenticate } from '../middleware/auth.middleware';
import { isPlatformAdmin } from '../middleware/rbac.middleware';
import asyncHandler from '../utils/async-handler';
import ApiError from '../utils/api-error';
import { sendSuccess } from '../utils/response';
import { validate } from '../middleware/validation.middleware';
import { generateInvoice } from '../services/billing.service';
import { verifyBankTransferPayment } from '../services/payment.service';
import { sendRequestApprovedEmail, sendRequestRejectedEmail } from '../services/email.service';
import logger from '../utils/logger';

const router = Router();

// All routes require platform admin authentication
router.use(authenticate, isPlatformAdmin);

/**
 * POST /api/admin/requests/:id/approve
 * Approve booking request
 */
router.post(
  '/requests/:id/approve',
  asyncHandler(async (req, res) => {
    const request = await Request.findById(req.params.id)
      .populate('user')
      .populate('organization');

    if (!request) {
      throw ApiError.notFound('Request not found');
    }

    if (request.status !== RequestStatus.SUBMITTED && request.status !== RequestStatus.UNDER_REVIEW) {
      throw ApiError.badRequest('Only submitted or under review requests can be approved');
    }

    // Update request
    request.status = RequestStatus.APPROVED;
    request.approvedBy = req.user!._id;
    request.approvedAt = new Date();
    await request.save();

    // Generate invoice
    const invoice = await generateInvoice(request);

    // Send approval email
    try {
      const user = request.user as any;
      await sendRequestApprovedEmail(
        user.email,
        user.firstName,
        request.requestNumber,
        request.title,
        request.total,
        invoice.invoiceNumber,
        `${process.env.FRONTEND_URL}/dashboard/requests/${request._id}`
      );
    } catch (error) {
      logger.error('Failed to send approval email:', error);
    }

    logger.info(`Request ${request.requestNumber} approved by ${req.user!.email}`);

    return sendSuccess(res, { request, invoice }, 'Request approved successfully');
  })
);

/**
 * POST /api/admin/requests/:id/reject
 * Reject booking request
 */
router.post(
  '/requests/:id/reject',
  asyncHandler(async (req, res) => {
    const { reason } = req.body;

    if (!reason) {
      throw ApiError.badRequest('Rejection reason is required');
    }

    const request = await Request.findById(req.params.id).populate('user');

    if (!request) {
      throw ApiError.notFound('Request not found');
    }

    if (request.status !== RequestStatus.SUBMITTED && request.status !== RequestStatus.UNDER_REVIEW) {
      throw ApiError.badRequest('Only submitted or under review requests can be rejected');
    }

    // Update request
    request.status = RequestStatus.REJECTED;
    request.rejectionReason = reason;
    request.reviewedBy = req.user!._id;
    request.reviewedAt = new Date();
    await request.save();

    // Send rejection email
    try {
      const user = request.user as any;
      await sendRequestRejectedEmail(
        user.email,
        user.firstName,
        request.requestNumber,
        request.title,
        reason,
        `${process.env.FRONTEND_URL}/dashboard/requests/${request._id}`
      );
    } catch (error) {
      logger.error('Failed to send rejection email:', error);
    }

    logger.info(`Request ${request.requestNumber} rejected by ${req.user!.email}`);

    return sendSuccess(res, request, 'Request rejected successfully');
  })
);

/**
 * POST /api/admin/payments/:id/verify
 * Verify bank transfer payment
 */
router.post(
  '/payments/:id/verify',
  asyncHandler(async (req, res) => {
    const payment = await verifyBankTransferPayment(req.params.id, req.user!._id.toString());

    // Update invoice
    const Invoice = (await import('../models/Invoice')).default;
    await Invoice.findByIdAndUpdate(payment.invoice, {
      status: 'paid',
      paidDate: new Date(),
    });

    // Update request
    const request = await Request.findById(payment.request).populate('user');
    if (request) {
      request.status = RequestStatus.IN_PROGRESS;
      await request.save();

      // Send confirmation email
      try {
        if (request.user) {
          const invoice = await Invoice.findById(payment.invoice);
          const { sendPaymentReceivedEmail } = await import('../services/email.service');
          await sendPaymentReceivedEmail(
            (request.user as any).email,
            (request.user as any).firstName,
            payment.paymentId,
            payment.amount,
            request.requestNumber,
            invoice!.invoiceNumber
          );
        }
      } catch (error) {
        logger.error('Failed to send payment confirmation email:', error);
      }
    }

    logger.info(`Bank transfer payment ${payment.paymentId} verified by ${req.user!.email}`);

    return sendSuccess(res, payment, 'Payment verified successfully');
  })
);

/**
 * GET /api/admin/payments/pending
 * Get all pending bank transfer payments
 */
router.get(
  '/payments/pending',
  asyncHandler(async (req, res) => {
    const payments = await Payment.find({
      method: 'bank_transfer',
      status: PaymentStatus.PENDING,
    })
      .populate('invoice', 'invoiceNumber total')
      .populate('request', 'requestNumber title')
      .populate('organization', 'name')
      .sort({ createdAt: -1 });

    return sendSuccess(res, payments);
  })
);

/**
 * GET /api/admin/stats
 * Get platform statistics
 */
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [
      totalOrganizations,
      totalUsers,
      totalRequests,
      pendingRequests,
      approvedRequests,
      totalRevenue,
    ] = await Promise.all([
      Organization.countDocuments(),
      User.countDocuments(),
      Request.countDocuments(),
      Request.countDocuments({ status: RequestStatus.SUBMITTED }),
      Request.countDocuments({ status: RequestStatus.APPROVED }),
      Payment.aggregate([
        { $match: { status: PaymentStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const stats = {
      totalOrganizations,
      totalUsers,
      totalRequests,
      pendingRequests,
      approvedRequests,
      totalRevenue: totalRevenue[0]?.total || 0,
    };

    return sendSuccess(res, stats);
  })
);

/**
 * GET /api/admin/organizations
 * Get all organizations
 */
router.get(
  '/organizations',
  asyncHandler(async (req, res) => {
    const organizations = await Organization.find().sort({ createdAt: -1 });
    return sendSuccess(res, organizations);
  })
);

/**
 * PATCH /api/admin/organizations/:id/verify
 * Verify organization
 */
router.patch(
  '/organizations/:id/verify',
  asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      throw ApiError.notFound('Organization not found');
    }

    organization.isVerified = true;
    organization.verifiedAt = new Date();
    await organization.save();

    logger.info(`Organization ${organization.name} verified by ${req.user!.email}`);

    return sendSuccess(res, organization, 'Organization verified successfully');
  })
);

/**
 * GET /api/admin/users
 * Get all users
 */
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await User.find().populate('organization', 'name').sort({ createdAt: -1 });
    return sendSuccess(res, users);
  })
);

export default router;
