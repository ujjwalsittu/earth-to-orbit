import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { successResponse } from '../utils/response';
import { authenticate } from '../middleware/auth.middleware';
import { PaymentService } from '../services/payment.service';
import { validateBody } from '../middleware/validation.middleware';
import { razorpayOrderCreateSchema, razorpayVerifySchema, bankTransferUploadSchema } from '@e2o/types';

const router = Router();
const paymentService = new PaymentService();

/**
 * POST /api/payments/razorpay/order
 */
router.post(
  '/razorpay/order',
  authenticate,
  validateBody(razorpayOrderCreateSchema),
  asyncHandler(async (req, res) => {
    const result = await paymentService.createRazorpayOrder(req.body.invoiceId);
    return successResponse(res, result, 'Razorpay order created');
  })
);

/**
 * POST /api/payments/razorpay/verify
 */
router.post(
  '/razorpay/verify',
  authenticate,
  validateBody(razorpayVerifySchema),
  asyncHandler(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const payment = await paymentService.verifyRazorpayPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    return successResponse(res, { payment }, 'Payment verified');
  })
);

/**
 * POST /api/payments/bank-transfer/upload
 */
router.post(
  '/bank-transfer/upload',
  authenticate,
  validateBody(bankTransferUploadSchema),
  asyncHandler(async (req, res) => {
    const authReq = req as any;
    const { invoiceId, receiptUrl, transactionId, bankName } = req.body;
    const payment = await paymentService.uploadBankTransferReceipt(
      invoiceId,
      receiptUrl,
      authReq.user.id,
      transactionId,
      bankName
    );
    return successResponse(res, { payment }, 'Receipt uploaded', 201);
  })
);

/**
 * GET /api/payments
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const authReq = req as any;
    const { page = 1, limit = 20 } = req.query;
    const result = await paymentService.getPaymentsByOrganization(
      authReq.user.organizationId,
      Number(page),
      Number(limit)
    );
    return successResponse(res, result);
  })
);

export default router;
