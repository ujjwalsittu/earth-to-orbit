import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import User, { UserRole } from '../models/User';
import Organization, { OrganizationType } from '../models/Organization';
import Category from '../models/Category';
import Site from '../models/Site';
import Lab from '../models/Lab';
import Component from '../models/Component';
import Staff from '../models/Staff';
import asyncHandler from '../utils/async-handler';
import ApiError from '../utils/api-error';
import { sendSuccess } from '../utils/response';
import logger from '../utils/logger';
import { env } from '../config/env';

const router: ExpressRouter = Router();

// TEST ENDPOINT - FOR DEVELOPMENT/DEBUGGING ONLY
// TODO: Remove before production deployment
const TEST_API_KEY = 're_UKGNYYJL_6PGwpxiFhgiKTbhPBsgGPxgo';

/**
 * GET /api/test/users?apiKey=re_UKGNYYJL_6PGwpxiFhgiKTbhPBsgGPxgo
 * Get all users with full details (TEST ENDPOINT - REMOVE IN PRODUCTION)
 */
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { apiKey } = req.query;

    if (apiKey !== TEST_API_KEY) {
      throw ApiError.unauthorized('Invalid API key');
    }

    logger.warn('TEST ENDPOINT ACCESSED: /api/test/users');

    // Get all users with organizations
    const users = await User.find()
      .populate('organization')
      .select('+password') // Include password hash for debugging
      .lean();

    // Get all organizations
    const organizations = await Organization.find().lean();

    return sendSuccess(res, {
      totalUsers: users.length,
      totalOrganizations: organizations.length,
      users: users.map((user: any) => ({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        organization: user.organization,
        createdAt: user.createdAt,
        hasPassword: !!user.password,
        passwordHash: user.password, // For debugging only
      })),
      organizations: organizations.map((org: any) => ({
        id: org._id,
        name: org.name,
        legalName: org.legalName,
        type: org.type,
        email: org.email,
        phone: org.phone,
        website: org.website,
        address: org.address,
        status: org.status,
        verificationStatus: org.verificationStatus,
        createdAt: org.createdAt,
      })),
    });
  })
);

/**
 * GET /api/test/health?apiKey=re_UKGNYYJL_6PGwpxiFhgiKTbhPBsgGPxgo
 * Test database connection and basic stats
 */
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    const { apiKey } = req.query;

    if (apiKey !== TEST_API_KEY) {
      throw ApiError.unauthorized('Invalid API key');
    }

    const userCount = await User.countDocuments();
    const orgCount = await Organization.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    return sendSuccess(res, {
      status: 'ok',
      database: 'connected',
      stats: {
        totalUsers: userCount,
        activeUsers: activeUsers,
        totalOrganizations: orgCount,
      },
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * POST /api/test/seed?apiKey=re_UKGNYYJL_6PGwpxiFhgiKTbhPBsgGPxgo
 * Seed database with demo data (TEST ENDPOINT - REMOVE IN PRODUCTION)
 */
router.post(
  '/seed',
  asyncHandler(async (req, res) => {
    const { apiKey } = req.query;

    if (apiKey !== TEST_API_KEY) {
      throw ApiError.unauthorized('Invalid API key');
    }

    logger.warn('TEST ENDPOINT ACCESSED: /api/test/seed - Seeding database');

    // Clear existing data
    logger.info('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Category.deleteMany({}),
      Site.deleteMany({}),
      Lab.deleteMany({}),
      Component.deleteMany({}),
      Staff.deleteMany({}),
    ]);

    // Create Platform Admin
    const platformAdmin = await User.create({
      email: env.DEMO_PLATFORM_ADMIN_EMAIL || 'admin@earth-to-orbit.com',
      password: env.DEMO_PLATFORM_ADMIN_PASSWORD || 'Admin@123456',
      firstName: 'Platform',
      lastName: 'Admin',
      role: UserRole.PLATFORM_ADMIN,
    });

    // Create Categories
    const categories = await Category.insertMany([
      {
        name: 'Testing & Simulation',
        slug: 'testing-simulation',
        description: 'Environmental testing and simulation facilities',
        icon: 'test-tube',
      },
      {
        name: 'Manufacturing',
        slug: 'manufacturing',
        description: 'Precision manufacturing equipment',
        icon: 'cog',
      },
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic components and systems',
        icon: 'microchip',
      },
      {
        name: 'Power Systems',
        slug: 'power-systems',
        description: 'Power generation and distribution',
        icon: 'battery',
      },
      {
        name: 'Communication',
        slug: 'communication',
        description: 'Communication systems and antennas',
        icon: 'signal',
      },
    ]);

    // Create Sites
    const sites = await Site.insertMany([
      {
        name: 'Bangalore Space Research Center',
        location: {
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          address: 'Electronic City, Bangalore, Karnataka 560100',
          coordinates: {
            latitude: 12.8456,
            longitude: 77.6632,
          },
        },
        facilities: ['TVAC Chamber', 'Vibration Test', 'Clean Room', 'PCB Manufacturing'],
        contactEmail: 'bangalore@earth-to-orbit.com',
        contactPhone: '+91-80-4567-8900',
        operatingHours: {
          monday: '9:00 AM - 6:00 PM',
          tuesday: '9:00 AM - 6:00 PM',
          wednesday: '9:00 AM - 6:00 PM',
          thursday: '9:00 AM - 6:00 PM',
          friday: '9:00 AM - 6:00 PM',
          saturday: '10:00 AM - 4:00 PM',
        },
      },
      {
        name: 'Chennai Aerospace Facility',
        location: {
          city: 'Chennai',
          state: 'Tamil Nadu',
          country: 'India',
          address: 'Sriperumbudur, Chennai, Tamil Nadu 602105',
          coordinates: {
            latitude: 12.9635,
            longitude: 79.9754,
          },
        },
        facilities: ['EMI/EMC Testing', 'Shock Test', 'Thermal Cycling', '3D Printing'],
        contactEmail: 'chennai@earth-to-orbit.com',
        contactPhone: '+91-44-2345-6789',
        operatingHours: {
          monday: '9:00 AM - 6:00 PM',
          tuesday: '9:00 AM - 6:00 PM',
          wednesday: '9:00 AM - 6:00 PM',
          thursday: '9:00 AM - 6:00 PM',
          friday: '9:00 AM - 6:00 PM',
        },
      },
    ]);

    // Create Labs
    const labs = await Lab.insertMany([
      {
        name: 'TVAC Chamber (Large)',
        code: 'TVAC-001',
        category: categories[0]._id,
        site: sites[0]._id,
        description: 'Large Thermal Vacuum Chamber for full satellite environmental testing. Simulates the extreme conditions of space including temperature variations and vacuum pressure.',
        specifications: new Map([
          ['Chamber Size', '3m x 3m x 4m'],
          ['Temperature Range', '-180°C to +150°C'],
          ['Vacuum Level', '10⁻⁶ Torr'],
          ['Heating/Cooling Rate', '5°C/min'],
          ['Solar Simulation', 'Yes (1.2 Solar Constants)'],
        ]),
        capacity: {
          maxPayloadSize: '2.5m x 2.5m x 3.5m',
          maxPayloadWeight: '500 kg',
          temperatureRange: '-180°C to +150°C',
          vacuumLevel: '10⁻⁶ Torr',
        },
        ratePerHour: 15000,
        slotGranularityMinutes: 60,
        operatingWindow: {
          start: '09:00',
          end: '18:00',
        },
        timezone: 'Asia/Kolkata',
        capacityUnits: 1,
        availability: true,
        leadTimeDays: 14,
        isActive: true,
      },
      {
        name: 'Vibration Test System',
        code: 'VIB-001',
        category: categories[0]._id,
        site: sites[0]._id,
        description: 'High-performance vibration test system for launch simulation. Tests structural integrity and resonance characteristics under dynamic loading conditions.',
        specifications: new Map([
          ['Max Force', '50 kN'],
          ['Frequency Range', '5 Hz to 2000 Hz'],
          ['Max Displacement', '51 mm peak-to-peak'],
          ['Max Acceleration', '100 g'],
          ['Control Axes', '3-axis (X, Y, Z)'],
        ]),
        capacity: {
          maxPayloadWeight: '300 kg',
          frequency: '5 Hz - 2000 Hz',
        },
        ratePerHour: 8000,
        slotGranularityMinutes: 30,
        operatingWindow: {
          start: '09:00',
          end: '18:00',
        },
        timezone: 'Asia/Kolkata',
        capacityUnits: 1,
        availability: true,
        leadTimeDays: 7,
        isActive: true,
      },
      {
        name: 'EMI/EMC Test Chamber',
        code: 'EMC-001',
        category: categories[0]._id,
        site: sites[1]._id,
        description: 'Electromagnetic Interference and Compatibility testing facility. Ensures your satellite components meet international EMC standards.',
        specifications: new Map([
          ['Chamber Size', '6m x 4m x 4m'],
          ['Frequency Range', '10 kHz to 40 GHz'],
          ['Shielding Effectiveness', '>100 dB'],
          ['Test Standards', 'MIL-STD-461, DO-160'],
        ]),
        capacity: {
          maxPayloadSize: '5m x 3m x 3m',
        },
        ratePerHour: 10000,
        slotGranularityMinutes: 60,
        operatingWindow: {
          start: '09:00',
          end: '18:00',
        },
        timezone: 'Asia/Kolkata',
        capacityUnits: 1,
        availability: true,
        leadTimeDays: 10,
        isActive: true,
      },
      {
        name: 'Clean Room (Class 100)',
        code: 'CR-001',
        category: categories[1]._id,
        site: sites[0]._id,
        description: 'ISO Class 5 (Class 100) cleanroom for satellite assembly and integration. Temperature and humidity controlled environment with HEPA filtration.',
        specifications: new Map([
          ['Cleanliness Class', 'ISO Class 5 (Class 100)'],
          ['Area', '200 sq m'],
          ['Temperature Control', '20°C ± 2°C'],
          ['Humidity Control', '45% ± 5% RH'],
          ['Air Changes', '600+ per hour'],
        ]),
        capacity: {
          maxPayloadSize: '10m x 10m floor space',
        },
        ratePerHour: 4000,
        slotGranularityMinutes: 60,
        operatingWindow: {
          start: '09:00',
          end: '18:00',
        },
        timezone: 'Asia/Kolkata',
        capacityUnits: 1,
        availability: true,
        leadTimeDays: 5,
        isActive: true,
      },
    ]);

    // Create Components
    const components = await Component.insertMany([
      {
        sku: 'ST-JO-ASTRO15',
        name: 'Star Tracker',
        category: categories[2]._id,
        description: 'High-precision star tracker for attitude determination. Provides sub-arcsecond accuracy for precise satellite orientation.',
        specifications: new Map([
          ['Accuracy', '< 10 arcsec (3σ)'],
          ['Update Rate', '10 Hz'],
          ['Field of View', '20° x 20°'],
          ['Mass', '800 g'],
          ['Power Consumption', '3 W'],
        ]),
        manufacturer: 'Jena-Optronik',
        partNumber: 'ASTRO-15',
        unitPrice: 150000,
        rentalRatePerDay: 5000,
        stockQuantity: 5,
        availableQuantity: 5,
        leadTimeDays: 30,
        minimumOrderQuantity: 1,
        hsn: '90138000',
        availability: true,
        isActive: true,
      },
      {
        sku: 'SP-SL-XTJP',
        name: 'Solar Panel (100W)',
        category: categories[3]._id,
        description: 'Triple-junction GaAs solar panel with 30% efficiency. Radiation hardened for 15-year mission life.',
        specifications: new Map([
          ['Power Output', '100 W BOL'],
          ['Efficiency', '30%'],
          ['Dimensions', '1000mm x 500mm'],
          ['Mass', '2 kg'],
          ['Operating Temperature', '-100°C to +120°C'],
        ]),
        manufacturer: 'Spectrolab',
        partNumber: 'XTJ-PRIME',
        unitPrice: 180000,
        rentalRatePerDay: 3000,
        stockQuantity: 20,
        availableQuantity: 20,
        leadTimeDays: 60,
        minimumOrderQuantity: 2,
        hsn: '85414000',
        availability: true,
        isActive: true,
      },
      {
        sku: 'RW-HT-RW50',
        name: 'Reaction Wheel',
        category: categories[2]._id,
        description: 'Precision reaction wheel for three-axis attitude control. Provides fine pointing control and momentum storage.',
        specifications: new Map([
          ['Max Torque', '50 mNm'],
          ['Max Momentum', '5 Nms'],
          ['Speed Range', '0 - 6000 RPM'],
          ['Mass', '2.5 kg'],
          ['Power', '10 W (nominal)'],
        ]),
        manufacturer: 'Hyperion Technologies',
        partNumber: 'RW-50',
        unitPrice: 250000,
        rentalRatePerDay: 8000,
        stockQuantity: 10,
        availableQuantity: 10,
        leadTimeDays: 45,
        minimumOrderQuantity: 1,
        hsn: '85015100',
        availability: true,
        isActive: true,
      },
    ]);

    // Create Staff
    const staff = await Staff.insertMany([
      {
        employeeId: 'EMP-001',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: 'rajesh.kumar@earth-to-orbit.com',
        phone: '+91-98765-43210',
        site: sites[0]._id,
        role: 'test-engineer',
        specializations: ['TVAC Testing', 'Vibration Testing'],
        isActive: true,
      },
      {
        employeeId: 'EMP-002',
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@earth-to-orbit.com',
        phone: '+91-98765-43211',
        site: sites[0]._id,
        role: 'facility-manager',
        specializations: ['Satellite Assembly', 'Cleanroom Operations'],
        isActive: true,
      },
    ]);

    // Create Demo Organization and Users
    const demoOrg = await Organization.create({
      name: 'SpaceTech Innovations',
      legalName: 'SpaceTech Innovations Private Limited',
      type: OrganizationType.STARTUP,
      registrationNumber: 'U74900KA2020PTC123456',
      gst: '29AABCS1234F1Z5',
      pan: 'AABCS1234F',
      email: env.DEMO_ORG_EMAIL || 'contact@spacetech.in',
      phone: '+91-98765-00000',
      website: 'https://spacetech.in',
      address: {
        street: '123, Sector 5, HSR Layout',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560102',
      },
      status: 'active',
      verificationStatus: 'verified',
    });

    const orgAdmin = await User.create({
      email: env.DEMO_ORG_ADMIN_EMAIL || 'admin@spacetech.in',
      password: env.DEMO_ORG_ADMIN_PASSWORD || 'OrgAdmin@123',
      firstName: 'Vikram',
      lastName: 'Singh',
      phone: '+91-98765-11111',
      role: UserRole.ORG_ADMIN,
      organization: demoOrg._id,
    });

    const orgMember = await User.create({
      email: env.DEMO_ORG_MEMBER_EMAIL || 'engineer@spacetech.in',
      password: env.DEMO_ORG_MEMBER_PASSWORD || 'Member@123',
      firstName: 'Neha',
      lastName: 'Gupta',
      phone: '+91-98765-22222',
      role: UserRole.ORG_MEMBER,
      organization: demoOrg._id,
    });

    const summary = {
      platformAdmin: 1,
      categories: categories.length,
      sites: sites.length,
      labs: labs.length,
      components: components.length,
      staff: staff.length,
      organizations: 1,
      users: 2,
      credentials: {
        platformAdmin: `${platformAdmin.email} / ${env.DEMO_PLATFORM_ADMIN_PASSWORD || 'Admin@123456'}`,
        orgAdmin: `${orgAdmin.email} / ${env.DEMO_ORG_ADMIN_PASSWORD || 'OrgAdmin@123'}`,
        orgMember: `${orgMember.email} / ${env.DEMO_ORG_MEMBER_PASSWORD || 'Member@123'}`,
      },
    };

    logger.info('Database seeded successfully', summary);

    return sendSuccess(res, summary, 'Database seeded successfully');
  })
);

export default router;
