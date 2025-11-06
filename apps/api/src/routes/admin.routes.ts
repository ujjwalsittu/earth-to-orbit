import { Router } from 'express';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { Request as RequestDoc } from '../models/Request';
import { Payment } from '../models/Payment';
import { AuditLog } from '../models/AuditLog';
import { asyncHandler } from '../utils/async-handler';
import { successResponse } from '../utils/response';
import { authenticate } from '../middleware/auth.middleware';
import { requirePlatformAdmin } from '../middleware/rbac.middleware';
import { PaymentService } from '../services/payment.service';

const router = Router();
const paymentService = new PaymentService();

// All routes require platform admin
router.use(authenticate, requirePlatformAdmin);

/**
 * GET /api/admin/organizations
 */
router.get(
  '/organizations',
  asyncHandler(async (req, res) => {
    const orgs = await Organization.find().sort({ createdAt: -1 });
    return successResponse(res, { organizations: orgs });
  })
);

/**
 * GET /api/admin/users
 */
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await User.find()
      .populate('organizationId', 'name')
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    return successResponse(res, { users });
  })
);

/**
 * GET /api/admin/requests/pending
 */
router.get(
  '/requests/pending',
  asyncHandler(async (req, res) => {
    const requests = await RequestDoc.find({
      status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] },
    })
      .populate('organizationId', 'name')
      .populate('requestedBy', 'firstName lastName email')
      .sort({ submittedAt: 1 });
    return successResponse(res, { requests });
  })
);

/**
 * POST /api/admin/payments/:id/verify
 */
router.post(
  '/payments/:id/verify',
  asyncHandler(async (req, res) => {
    const authReq = req as any;
    const { approved, notes } = req.body;
    const payment = await paymentService.verifyBankTransfer(
      req.params.id,
      authReq.user.id,
      approved,
      notes
    );
    return successResponse(res, { payment }, 'Payment verification completed');
  })
);

/**
 * GET /api/admin/audit-logs
 */
router.get(
  '/audit-logs',
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'firstName lastName email'),
      AuditLog.countDocuments(),
    ]);

    return successResponse(res, {
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  })
);

export default router;
