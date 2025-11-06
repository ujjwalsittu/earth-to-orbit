import { Router } from 'express';
import { Invoice } from '../models/Invoice';
import { asyncHandler } from '../utils/async-handler';
import { successResponse } from '../utils/response';
import { authenticate } from '../middleware/auth.middleware';
import { BillingService } from '../services/billing.service';
import { NotFoundError } from '../utils/api-error';

const router = Router();
const billingService = new BillingService();

/**
 * GET /api/billing/invoices
 */
router.get(
  '/invoices',
  authenticate,
  asyncHandler(async (req, res) => {
    const authReq = req as any;
    const { page = 1, limit = 20 } = req.query;

    const query: any = { organizationId: authReq.user.organizationId };
    const skip = (Number(page) - 1) * Number(limit);

    const [invoices, total] = await Promise.all([
      Invoice.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Invoice.countDocuments(query),
    ]);

    return successResponse(res, {
      invoices,
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
 * GET /api/billing/invoices/:id/pdf
 */
router.get(
  '/invoices/:id/pdf',
  authenticate,
  asyncHandler(async (req, res) => {
    const pdfBuffer = await billingService.generateInvoicePDF(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${req.params.id}.pdf`);
    res.send(pdfBuffer);
  })
);

export default router;
