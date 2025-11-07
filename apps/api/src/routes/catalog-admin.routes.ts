import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { z } from 'zod';
import Site from '../models/Site';
import Lab from '../models/Lab';
import Component from '../models/Component';
import Staff from '../models/Staff';
import { authenticate } from '../middleware/auth.middleware';
import { isPlatformAdmin } from '../middleware/rbac.middleware';
import asyncHandler from '../utils/async-handler';
import ApiError from '../utils/api-error';
import { sendSuccess } from '../utils/response';
import { validate } from '../middleware/validation.middleware';
import logger from '../utils/logger';

const router: ExpressRouter = Router();

// All routes require platform admin authentication
router.use(authenticate, isPlatformAdmin);

// =============================================================================
// SITE MANAGEMENT
// =============================================================================

const createSiteSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    code: z.string().optional(),
    location: z.object({
      city: z.string().min(1),
      state: z.string().min(1),
      country: z.string().min(1),
      address: z.string().min(1),
      postalCode: z.string().optional(),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }).optional(),
    }),
    facilities: z.array(z.string()).optional(),
    contactEmail: z.string().email(),
    contactPhone: z.string(),
    operatingHours: z.object({
      monday: z.string().optional(),
      tuesday: z.string().optional(),
      wednesday: z.string().optional(),
      thursday: z.string().optional(),
      friday: z.string().optional(),
      saturday: z.string().optional(),
      sunday: z.string().optional(),
    }).optional(),
  }),
});

router.post(
  '/sites',
  validate(createSiteSchema),
  asyncHandler(async (req, res) => {
    const site = await Site.create(req.body);
    logger.info(`Site ${site.name} created by ${req.user!.email}`);
    return sendSuccess(res, site, 'Site created successfully', 201);
  })
);

router.patch(
  '/sites/:id',
  asyncHandler(async (req, res) => {
    const site = await Site.findById(req.params.id);
    if (!site) {
      throw ApiError.notFound('Site not found');
    }

    Object.assign(site, req.body);
    await site.save();

    logger.info(`Site ${site.name} updated by ${req.user!.email}`);
    return sendSuccess(res, site, 'Site updated successfully');
  })
);

router.delete(
  '/sites/:id',
  asyncHandler(async (req, res) => {
    const site = await Site.findById(req.params.id);
    if (!site) {
      throw ApiError.notFound('Site not found');
    }

    site.isActive = false;
    await site.save();

    logger.info(`Site ${site.name} deactivated by ${req.user!.email}`);
    return sendSuccess(res, null, 'Site deactivated successfully');
  })
);

// =============================================================================
// LAB MANAGEMENT
// =============================================================================

const createLabSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    site: z.string(),
    category: z.string(),
    description: z.string(),
    specifications: z.record(z.string()).optional(),
    capacity: z.object({
      maxPayloadSize: z.string().optional(),
      maxPayloadWeight: z.string().optional(),
      temperatureRange: z.string().optional(),
      vacuumLevel: z.string().optional(),
      frequency: z.string().optional(),
    }).optional(),
    ratePerHour: z.number().min(0),
    ratePerMinute: z.number().min(0).optional(),
    slotGranularityMinutes: z.number().min(15).max(60),
    operatingWindow: z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
    }),
    timezone: z.string().default('Asia/Kolkata'),
    capacityUnits: z.number().min(1).default(1),
    leadTimeDays: z.number().min(0).default(0),
    maintenanceWindows: z.array(z.object({
      start: z.string(),
      end: z.string(),
      reason: z.string().optional(),
    })).optional(),
  }),
});

router.post(
  '/labs',
  validate(createLabSchema),
  asyncHandler(async (req, res) => {
    const lab = await Lab.create(req.body);
    logger.info(`Lab ${lab.name} created by ${req.user!.email}`);
    return sendSuccess(res, lab, 'Lab created successfully', 201);
  })
);

router.patch(
  '/labs/:id',
  asyncHandler(async (req, res) => {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      throw ApiError.notFound('Lab not found');
    }

    Object.assign(lab, req.body);
    await lab.save();

    logger.info(`Lab ${lab.name} updated by ${req.user!.email}`);
    return sendSuccess(res, lab, 'Lab updated successfully');
  })
);

router.delete(
  '/labs/:id',
  asyncHandler(async (req, res) => {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      throw ApiError.notFound('Lab not found');
    }

    lab.isActive = false;
    await lab.save();

    logger.info(`Lab ${lab.name} deactivated by ${req.user!.email}`);
    return sendSuccess(res, null, 'Lab deactivated successfully');
  })
);

// =============================================================================
// COMPONENT MANAGEMENT
// =============================================================================

const createComponentSchema = z.object({
  body: z.object({
    sku: z.string().min(1),
    name: z.string().min(1),
    category: z.string(),
    description: z.string(),
    specifications: z.record(z.string()).optional(),
    manufacturer: z.string().optional(),
    partNumber: z.string().optional(),
    unitPrice: z.number().min(0),
    rentalRatePerDay: z.number().min(0).optional(),
    stockQuantity: z.number().min(0).default(0),
    availableQuantity: z.number().min(0).default(0),
    leadTimeDays: z.number().min(0).default(0),
    minimumOrderQuantity: z.number().min(1).default(1),
    hsn: z.string().optional(),
    images: z.array(z.string()).optional(),
  }),
});

router.post(
  '/components',
  validate(createComponentSchema),
  asyncHandler(async (req, res) => {
    const component = await Component.create(req.body);
    logger.info(`Component ${component.name} created by ${req.user!.email}`);
    return sendSuccess(res, component, 'Component created successfully', 201);
  })
);

router.patch(
  '/components/:id',
  asyncHandler(async (req, res) => {
    const component = await Component.findById(req.params.id);
    if (!component) {
      throw ApiError.notFound('Component not found');
    }

    Object.assign(component, req.body);
    await component.save();

    logger.info(`Component ${component.name} updated by ${req.user!.email}`);
    return sendSuccess(res, component, 'Component updated successfully');
  })
);

router.delete(
  '/components/:id',
  asyncHandler(async (req, res) => {
    const component = await Component.findById(req.params.id);
    if (!component) {
      throw ApiError.notFound('Component not found');
    }

    component.isActive = false;
    await component.save();

    logger.info(`Component ${component.name} deactivated by ${req.user!.email}`);
    return sendSuccess(res, null, 'Component deactivated successfully');
  })
);

// =============================================================================
// STAFF MANAGEMENT
// =============================================================================

const createStaffSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string(),
    site: z.string(),
    role: z.string(),
    department: z.string().optional(),
    expertise: z.array(z.string()).optional(),
    ratePerHour: z.number().min(0).optional(),
  }),
});

router.post(
  '/staff',
  validate(createStaffSchema),
  asyncHandler(async (req, res) => {
    // Check if email already exists
    const existing = await Staff.findOne({ email: req.body.email });
    if (existing) {
      throw ApiError.badRequest('Staff member with this email already exists');
    }

    const staff = await Staff.create(req.body);
    logger.info(`Staff ${staff.firstName} ${staff.lastName} created by ${req.user!.email}`);
    return sendSuccess(res, staff, 'Staff member created successfully', 201);
  })
);

router.patch(
  '/staff/:id',
  asyncHandler(async (req, res) => {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      throw ApiError.notFound('Staff member not found');
    }

    Object.assign(staff, req.body);
    await staff.save();

    logger.info(`Staff ${staff.firstName} ${staff.lastName} updated by ${req.user!.email}`);
    return sendSuccess(res, staff, 'Staff member updated successfully');
  })
);

router.delete(
  '/staff/:id',
  asyncHandler(async (req, res) => {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      throw ApiError.notFound('Staff member not found');
    }

    staff.isActive = false;
    await staff.save();

    logger.info(`Staff ${staff.firstName} ${staff.lastName} deactivated by ${req.user!.email}`);
    return sendSuccess(res, null, 'Staff member deactivated successfully');
  })
);

export default router;
