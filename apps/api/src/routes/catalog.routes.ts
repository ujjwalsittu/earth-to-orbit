import { Router } from 'express';
import { Site } from '../models/Site';
import { Category } from '../models/Category';
import { Lab } from '../models/Lab';
import { Component } from '../models/Component';
import { Staff } from '../models/Staff';
import { asyncHandler } from '../utils/async-handler';
import { successResponse } from '../utils/response';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { requirePlatformAdmin } from '../middleware/rbac.middleware';
import { NotFoundError } from '../utils/api-error';

const router = Router();

// Public routes (read-only catalog)

/**
 * GET /api/catalog/sites
 */
router.get(
  '/sites',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const sites = await Site.find({ isActive: true }).sort({ name: 1 });
    return successResponse(res, { sites });
  })
);

/**
 * GET /api/catalog/categories
 */
router.get(
  '/categories',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return successResponse(res, { categories });
  })
);

/**
 * GET /api/catalog/labs
 */
router.get(
  '/labs',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { siteId, categoryId } = req.query;
    const query: any = { isActive: true };

    if (siteId) query.siteId = siteId;
    if (categoryId) query.categoryId = categoryId;

    const labs = await Lab.find(query)
      .populate('siteId', 'name code')
      .populate('categoryId', 'name')
      .sort({ name: 1 });

    return successResponse(res, { labs });
  })
);

/**
 * GET /api/catalog/labs/:id
 */
router.get(
  '/labs/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const lab = await Lab.findById(req.params.id)
      .populate('siteId')
      .populate('categoryId');

    if (!lab) {
      throw new NotFoundError('Lab not found');
    }

    return successResponse(res, { lab });
  })
);

/**
 * GET /api/catalog/components
 */
router.get(
  '/components',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { categoryId, isRentable } = req.query;
    const query: any = { isActive: true };

    if (categoryId) query.categoryId = categoryId;
    if (isRentable !== undefined) query.isRentable = isRentable === 'true';

    const components = await Component.find(query)
      .populate('categoryId', 'name')
      .sort({ name: 1 });

    return successResponse(res, { components });
  })
);

/**
 * GET /api/catalog/staff
 */
router.get(
  '/staff',
  authenticate,
  requirePlatformAdmin,
  asyncHandler(async (req, res) => {
    const { siteId } = req.query;
    const query: any = { isActive: true };

    if (siteId) query.siteIds = siteId;

    const staff = await Staff.find(query)
      .populate('siteIds', 'name code')
      .sort({ lastName: 1, firstName: 1 });

    return successResponse(res, { staff });
  })
);

// Admin routes (CRUD operations)

/**
 * POST /api/catalog/sites
 */
router.post(
  '/sites',
  authenticate,
  requirePlatformAdmin,
  asyncHandler(async (req, res) => {
    const site = new Site(req.body);
    await site.save();
    return successResponse(res, { site }, 'Site created', 201);
  })
);

/**
 * PUT /api/catalog/sites/:id
 */
router.put(
  '/sites/:id',
  authenticate,
  requirePlatformAdmin,
  asyncHandler(async (req, res) => {
    const site = await Site.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!site) {
      throw new NotFoundError('Site not found');
    }
    return successResponse(res, { site }, 'Site updated');
  })
);

/**
 * POST /api/catalog/labs
 */
router.post(
  '/labs',
  authenticate,
  requirePlatformAdmin,
  asyncHandler(async (req, res) => {
    const lab = new Lab(req.body);
    await lab.save();
    return successResponse(res, { lab }, 'Lab created', 201);
  })
);

/**
 * PUT /api/catalog/labs/:id
 */
router.put(
  '/labs/:id',
  authenticate,
  requirePlatformAdmin,
  asyncHandler(async (req, res) => {
    const lab = await Lab.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lab) {
      throw new NotFoundError('Lab not found');
    }
    return successResponse(res, { lab }, 'Lab updated');
  })
);

export default router;
