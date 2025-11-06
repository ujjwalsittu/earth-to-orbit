import { Router } from 'express';
import { z } from 'zod';
import Payment from '../models/Payment';
import Invoice, { InvoiceStatus } from '../models/Invoice';
import Request, { RequestStatus } from '../models/Request';
import { authenticate } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import asyncHandler from '../utils/async-handler';
import ApiError from '../utils/api-error';
import { sendSuccess } from '../utils/response';
import { validate } from '../middleware/validation.middleware';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createBankTransferPayment,
} from '../services/payment.service';
import { markInvoiceAsPaid } from '../services/billing.service';
import { sendPaymentReceivedEmail } from '../services/email.service';
import logger from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticate);

const createOrderSchema = z.object({
  body: z.object({
    invoiceId: z.string(),
  }),
});

const verifyPaymentSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
  }),
});

const bankTransferSchema = z.object({
  body: z.object({
    invoiceId: z.string(),
    transactionId: z.string().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    proof: z.string().optional(),
  }),
});

/**
 * POST /api/payments/create-order
 * Create Razorpay order
 */
router.post(
  '/create-order',
  validate(createOrderSchema),
  asyncHandler(async (req, res) => {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId).populate('request');

    if (!invoice) {
      throw ApiError.notFound('Invoice not found');
    }

    // Check access
    if (req.user!.role !== UserRole.PLATFORM_ADMIN) {
      if (invoice.organization.toString() !== req.user!.organization?.toString()) {
        throw ApiError.forbidden('You do not have access to this invoice');
      }
    }

    // Check if already paid
    if (invoice.status === InvoiceStatus.PAID) {
      throw ApiError.badRequest('Invoice is already paid');
    }

    const { orderId, payment } = await createRazorpayOrder(
      invoiceId,
      invoice.request.toString(),
      invoice.organization.toString(),
      invoice.total
    );

    return sendSuccess(res, {
      orderId,
      amount: invoice.total,
      currency: invoice.currency,
      paymentId: payment.paymentId,
    });
  })
);

/**
 * POST /api/payments/verify
 * Verify Razorpay payment
 */
router.post(
  '/verify',
  validate(verifyPaymentSchema),
  asyncHandler(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const payment = await verifyRazorpayPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    // Update invoice
    await markInvoiceAsPaid(payment.invoice.toString());

    // Update request status
    const request = await Request.findById(payment.request).populate('user');
    if (request) {
      request.status = RequestStatus.IN_PROGRESS;
      await request.save();

      // Send confirmation email
      try {
        if (request.user) {
          const invoice = await Invoice.findById(payment.invoice);
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

    logger.info(`Payment ${payment.paymentId} completed successfully`);

    return sendSuccess(res, { payment }, 'Payment verified successfully');
  })
);

/**
 * POST /api/payments/bank-transfer
 * Submit bank transfer payment
 */
router.post(
  '/bank-transfer',
  validate(bankTransferSchema),
  asyncHandler(async (req, res) => {
    const { invoiceId, transactionId, bankName, accountNumber, proof } = req.body;

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      throw ApiError.notFound('Invoice not found');
    }

    // Check access
    if (req.user!.role !== UserRole.PLATFORM_ADMIN) {
      if (invoice.organization.toString() !== req.user!.organization?.toString()) {
        throw ApiError.forbidden('You do not have access to this invoice');
      }
    }

    // Check if already paid
    if (invoice.status === InvoiceStatus.PAID) {
      throw ApiError.badRequest('Invoice is already paid');
    }

    const payment = await createBankTransferPayment(
      invoiceId,
      invoice.request.toString(),
      invoice.organization.toString(),
      invoice.total,
      transactionId,
      bankName,
      accountNumber,
      proof
    );

    logger.info(`Bank transfer payment ${payment.paymentId} submitted`);

    return sendSuccess(
      res,
      { payment },
      'Bank transfer details submitted. Awaiting admin verification.',
      201
    );
  })
);

/**
 * GET /api/payments
 * Get all payments for current user/organization
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query: any = {};

    // Platform admins can see all payments
    if (req.user!.role === UserRole.PLATFORM_ADMIN) {
      // No filter
    } else {
      // Org members can only see their organization's payments
      query.organization = req.user!.organization;
    }

    const payments = await Payment.find(query)
      .populate('invoice', 'invoiceNumber total')
      .populate('request', 'requestNumber title')
      .sort({ createdAt: -1 });

    return sendSuccess(res, payments);
  })
);

/**
 * GET /api/payments/:id
 * Get payment by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id)
      .populate('invoice')
      .populate('request')
      .populate('organization');

    if (!payment) {
      throw ApiError.notFound('Payment not found');
    }

    // Check access
    if (req.user!.role !== UserRole.PLATFORM_ADMIN) {
      if (payment.organization.toString() !== req.user!.organization?.toString()) {
        throw ApiError.forbidden('You do not have access to this payment');
      }
    }

    return sendSuccess(res, payment);
  })
);

export default router;
