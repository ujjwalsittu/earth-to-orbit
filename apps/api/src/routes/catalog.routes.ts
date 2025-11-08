import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { z } from 'zod';
import Lab from '../models/Lab';
import Component from '../models/Component';
import Category from '../models/Category';
import Site from '../models/Site';
import asyncHandler from '../utils/async-handler';
import ApiError from '../utils/api-error';
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';
import { validate } from '../middleware/validation.middleware';
import { optionalAuthenticate } from '../middleware/auth.middleware';

const router: ExpressRouter = Router();

// Apply optional authentication to all routes
router.use(optionalAuthenticate);

/**
 * GET /api/catalog/categories
 * Get all categories
 */
router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    return sendSuccess(res, categories);
  })
);

/**
 * GET /api/catalog/sites
 * Get all sites
 */
router.get(
  '/sites',
  asyncHandler(async (req, res) => {
    const sites = await Site.find({ isActive: true }).sort({ name: 1 });

    return sendSuccess(res, sites);
  })
);

/**
 * GET /api/catalog/labs
 * Get all labs with filtering and pagination
 */
router.get(
  '/labs',
  asyncHandler(async (req, res) => {
    const {
      category,
      site,
      search,
      minPrice,
      maxPrice,
      availability,
      page = '1',
      limit = '20',
    } = req.query;

    const query: any = { isActive: true };

    // Apply filters
    if (category) {
      query.category = category;
    }

    if (site) {
      query.site = site;
    }

    if (availability === 'true') {
      query.availability = true;
    }

    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [labs, total] = await Promise.all([
      Lab.find(query)
        .populate('category', 'name slug')
        .populate('site', 'name location')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum),
      Lab.countDocuments(query),
    ]);

    return sendPaginatedSuccess(
      res,
      labs,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    );
  })
);

/**
 * GET /api/catalog/labs/:id
 * Get lab by ID
 */
router.get(
  '/labs/:id',
  asyncHandler(async (req, res) => {
    const lab = await Lab.findOne({ _id: req.params.id, isActive: true })
      .populate('category', 'name slug description')
      .populate('site', 'name location contactEmail contactPhone operatingHours');

    if (!lab) {
      throw ApiError.notFound('Lab not found');
    }

    return sendSuccess(res, lab);
  })
);

/**
 * GET /api/catalog/components
 * Get all components with filtering and pagination
 */
router.get(
  '/components',
  asyncHandler(async (req, res) => {
    const {
      category,
      site,
      search,
      minPrice,
      maxPrice,
      availableOnly,
      page = '1',
      limit = '20',
    } = req.query;

    const query: any = { isActive: true };

    // Apply filters
    if (category) {
      query.category = category;
    }

    if (site) {
      query.site = site;
    }

    if (availableOnly === 'true') {
      query.availableQuantity = { $gt: 0 };
    }

    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [components, total] = await Promise.all([
      Component.find(query)
        .populate('category', 'name slug')
        .populate('site', 'name location')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum),
      Component.countDocuments(query),
    ]);

    return sendPaginatedSuccess(
      res,
      components,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    );
  })
);

/**
 * GET /api/catalog/components/:id
 * Get component by ID
 */
router.get(
  '/components/:id',
  asyncHandler(async (req, res) => {
    const component = await Component.findOne({ _id: req.params.id, isActive: true })
      .populate('category', 'name slug description')
      .populate('site', 'name location contactEmail contactPhone');

    if (!component) {
      throw ApiError.notFound('Component not found');
    }

    return sendSuccess(res, component);
  })
);

export default router;
