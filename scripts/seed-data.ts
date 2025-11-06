import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: './apps/api/.env' });

// Import models (adjust paths as needed)
import '../apps/api/src/models/User';
import '../apps/api/src/models/Organization';
import '../apps/api/src/models/Site';
import '../apps/api/src/models/Category';
import '../apps/api/src/models/Lab';
import '../apps/api/src/models/Component';
import '../apps/api/src/models/Staff';

const User = mongoose.model('User');
const Organization = mongoose.model('Organization');
const Site = mongoose.model('Site');
const Category = mongoose.model('Category');
const Lab = mongoose.model('Lab');
const Component = mongoose.model('Component');
const Staff = mongoose.model('Staff');

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected!');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Site.deleteMany({}),
      Category.deleteMany({}),
      Lab.deleteMany({}),
      Component.deleteMany({}),
      Staff.deleteMany({}),
    ]);

    // 1. Create Sites
    console.log('Creating sites...');
    const sites = await Site.insertMany([
      {
        name: 'Bangalore Aerospace Center',
        code: 'BLR-01',
        location: {
          address: 'Electronic City Phase 1',
          city: 'Bangalore',
          state: 'Karnataka',
          coordinates: { lat: 12.8456, lng: 77.6653 },
        },
        timezone: 'Asia/Kolkata',
        operatingHours: { start: '08:00', end: '20:00' },
        contactPhone: '+91-80-12345678',
        contactEmail: 'blr@earth-to-orbit.com',
        facilities: ['Cleanroom ISO 7', 'Power Backup', 'Climate Control', 'Loading Bay'],
        isActive: true,
      },
      {
        name: 'Hyderabad Test Facility',
        code: 'HYD-01',
        location: {
          address: 'Shamshabad Airport Road',
          city: 'Hyderabad',
          state: 'Telangana',
          coordinates: { lat: 17.2403, lng: 78.4294 },
        },
        timezone: 'Asia/Kolkata',
        operatingHours: { start: '09:00', end: '18:00' },
        contactPhone: '+91-40-98765432',
        contactEmail: 'hyd@earth-to-orbit.com',
        facilities: ['Vibration Test Area', 'EMC Chamber', 'High Bay Area'],
        isActive: true,
      },
    ]);

    // 2. Create Categories
    console.log('Creating categories...');
    const categories = await Category.insertMany([
      { name: 'Environmental Testing', slug: 'environmental-testing', isActive: true },
      { name: 'Vibration & Shock', slug: 'vibration-shock', isActive: true },
      { name: 'EMC/EMI Testing', slug: 'emc-emi', isActive: true },
      { name: 'Thermal Testing', slug: 'thermal-testing', isActive: true },
      { name: 'Cleanrooms & Assembly', slug: 'cleanrooms', isActive: true },
      { name: 'Satellite Components', slug: 'satellite-components', isActive: true },
      { name: 'Power Systems', slug: 'power-systems', isActive: true },
      { name: 'Communication Systems', slug: 'communication', isActive: true },
      { name: 'Attitude Control', slug: 'attitude-control', isActive: true },
    ]);

    const envCat = categories[0];
    const vibCat = categories[1];
    const emcCat = categories[2];
    const thermalCat = categories[3];
    const cleanroomCat = categories[4];
    const satCompCat = categories[5];
    const powerCat = categories[6];
    const commCat = categories[7];
    const attitudeCat = categories[8];

    // 3. Create Labs/Machinery
    console.log('Creating labs and machinery...');
    await Lab.insertMany([
      {
        siteId: sites[0]._id,
        categoryId: envCat._id,
        name: 'Thermal Vacuum (TVAC) Chamber',
        code: 'TVAC-01',
        description: 'Large thermal vacuum chamber for satellite environmental testing. Simulates space conditions including high vacuum and extreme temperatures.',
        specifications: {
          volume: '8 cubic meters',
          temperature_range: '-180°C to +150°C',
          vacuum_level: '1×10⁻⁶ mbar',
          cooling_rate: '5°C/min',
          heating_rate: '3°C/min',
        },
        capabilities: [
          'Thermal cycling',
          'Vacuum bakeout',
          'Outgassing tests',
          'Solar simulation',
        ],
        capacity: 1,
        slotGranularityMinutes: 60,
        ratePerHour: 15000,
        minimumBookingHours: 4,
        maximumBookingHours: 72,
        requiresApproval: true,
        requiresTraining: true,
        isActive: true,
      },
      {
        siteId: sites[0]._id,
        categoryId: vibCat._id,
        name: 'Electrodynamic Vibration Table',
        code: 'VIB-TABLE-01',
        description: 'High-performance shaker table for random, sine, and shock vibration testing.',
        specifications: {
          force_rating: '50 kN',
          frequency_range: '5 Hz to 3000 Hz',
          max_payload: '500 kg',
          displacement: '51 mm pk-pk',
        },
        capabilities: [
          'Random vibration',
          'Sine vibration',
          'Shock testing',
          'Resonance search',
        ],
        capacity: 1,
        slotGranularityMinutes: 30,
        ratePerHour: 8000,
        minimumBookingHours: 2,
        requiresApproval: true,
        requiresTraining: true,
        isActive: true,
      },
      {
        siteId: sites[1]._id,
        categoryId: emcCat._id,
        name: 'RF Anechoic Chamber',
        code: 'RF-ANEC-01',
        description: 'Fully anechoic chamber for electromagnetic compatibility and antenna testing.',
        specifications: {
          dimensions: '8m x 6m x 6m',
          frequency_range: '100 MHz to 40 GHz',
          shielding_effectiveness: '>100 dB',
        },
        capabilities: [
          'Radiated emissions',
          'Radiated immunity',
          'Antenna pattern testing',
          'SAR testing',
        ],
        capacity: 1,
        slotGranularityMinutes: 60,
        ratePerHour: 12000,
        minimumBookingHours: 3,
        requiresApproval: true,
        isActive: true,
      },
      {
        siteId: sites[0]._id,
        categoryId: thermalCat._id,
        name: 'Thermal Cycling Chamber',
        code: 'THERM-CYC-01',
        description: 'Programmable thermal cycling chamber for component and subsystem testing.',
        specifications: {
          volume: '1 cubic meter',
          temperature_range: '-70°C to +180°C',
          ramp_rate: '5°C/min',
          uniformity: '±2°C',
        },
        capabilities: [
          'Temperature cycling',
          'Dwell testing',
          'ESS screening',
        ],
        capacity: 2,
        slotGranularityMinutes: 60,
        ratePerHour: 3500,
        minimumBookingHours: 1,
        requiresApproval: false,
        isActive: true,
      },
      {
        siteId: sites[0]._id,
        categoryId: cleanroomCat._id,
        name: 'ISO 7 Cleanroom Assembly Area',
        code: 'CLEAN-ISO7-01',
        description: 'Class 10,000 cleanroom for satellite assembly and integration.',
        specifications: {
          area: '50 square meters',
          iso_class: 'ISO 7 (Class 10,000)',
          particle_count: '<10,000 particles/ft³',
        },
        capabilities: [
          'Satellite assembly',
          'PCB handling',
          'Optical component integration',
        ],
        capacity: 3,
        slotGranularityMinutes: 60,
        ratePerHour: 2000,
        minimumBookingHours: 4,
        requiresApproval: true,
        isActive: true,
      },
    ]);

    // 4. Create Components
    console.log('Creating components...');
    await Component.insertMany([
      {
        categoryId: satCompCat._id,
        sku: 'SAT-OBC-001',
        name: 'On-Board Computer (OBC) - ARM Cortex-A7',
        description: 'Radiation-tolerant on-board computer for CubeSat/SmallSat missions.',
        manufacturer: 'EnduroSat',
        specifications: {
          processor: 'ARM Cortex-A7 dual-core 1GHz',
          ram: '1GB DDR3',
          flash: '8GB eMMC',
          interfaces: ['I2C', 'SPI', 'UART', 'CAN'],
          power_consumption: '2.5W typical',
          radiation_tolerance: '50 krad TID',
        },
        stockQuantity: 5,
        leadTimeDays: 45,
        pricePerUnit: 185000,
        isPurchaseable: true,
        requiresApproval: true,
        isActive: true,
      },
      {
        categoryId: powerCat._id,
        sku: 'SAT-EPS-001',
        name: 'Electrical Power System (EPS) - 28V',
        description: 'Complete EPS with MPPT, battery management, and power distribution.',
        manufacturer: 'Clyde Space',
        specifications: {
          output_voltage: '28V regulated',
          max_power: '100W',
          mppt_channels: 4,
          battery_chemistry: 'Li-Ion',
          efficiency: '>90%',
        },
        stockQuantity: 3,
        leadTimeDays: 60,
        pricePerUnit: 450000,
        isPurchaseable: true,
        requiresApproval: true,
        isActive: true,
      },
      {
        categoryId: powerCat._id,
        sku: 'SAT-SOLAR-001',
        name: 'Triple-Junction Solar Panel - 30W',
        description: 'High-efficiency deployable solar panel with 30% efficiency.',
        manufacturer: 'Spectrolab',
        specifications: {
          power_output: '30W @ BOL',
          efficiency: '30%',
          dimensions: '300mm x 200mm',
          mass: '180g',
          cells: 'Triple-junction GaAs',
        },
        stockQuantity: 20,
        leadTimeDays: 30,
        pricePerUnit: 125000,
        isPurchaseable: true,
        isActive: true,
      },
      {
        categoryId: commCat._id,
        sku: 'SAT-RADIO-UHF',
        name: 'UHF Transceiver - 437 MHz',
        description: 'Half-duplex UHF radio for telemetry and telecommand.',
        manufacturer: 'ISIS',
        specifications: {
          frequency: '437 MHz',
          tx_power: '2W',
          data_rate: '1200-9600 bps',
          modulation: 'GFSK',
        },
        stockQuantity: 8,
        leadTimeDays: 35,
        pricePerUnit: 95000,
        isPurchaseable: true,
        isActive: true,
      },
      {
        categoryId: attitudeCat._id,
        sku: 'SAT-REACTION-WHEEL',
        name: 'Reaction Wheel - 5 mNms',
        description: 'Miniature reaction wheel for 3-axis attitude control.',
        manufacturer: 'Blue Canyon Technologies',
        specifications: {
          momentum_storage: '5 mNms',
          max_torque: '0.5 mNm',
          power_consumption: '1.5W',
          mass: '150g',
        },
        stockQuantity: 4,
        leadTimeDays: 90,
        pricePerUnit: 380000,
        isPurchaseable: true,
        requiresApproval: true,
        isActive: true,
      },
      {
        categoryId: attitudeCat._id,
        sku: 'SAT-STAR-TRACKER',
        name: 'Star Tracker - Sub-arcsecond',
        description: 'High-precision star tracker for fine attitude determination.',
        manufacturer: 'SatRevolution',
        specifications: {
          accuracy: '0.5 arcsec',
          update_rate: '4 Hz',
          fov: '15° x 11°',
          mass: '250g',
        },
        stockQuantity: 2,
        leadTimeDays: 120,
        pricePerUnit: 850000,
        isPurchaseable: true,
        requiresApproval: true,
        isActive: true,
      },
      {
        categoryId: commCat._id,
        sku: 'SAT-ANTENNA-DIPOLE',
        name: 'Deployable Dipole Antenna - UHF',
        description: 'Tape-spring deployable dipole antenna for UHF communications.',
        specifications: {
          frequency: '430-450 MHz',
          gain: '2 dBi',
          vswr: '<2:1',
          deployment: 'Tape spring mechanism',
        },
        stockQuantity: 15,
        leadTimeDays: 20,
        pricePerUnit: 35000,
        isPurchaseable: true,
        isActive: true,
      },
    ]);

    // 5. Create Staff
    console.log('Creating staff...');
    await Staff.insertMany([
      {
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: 'rajesh.kumar@e2o.com',
        phone: '+91-9876543210',
        skills: ['Thermal Testing', 'TVAC Operations', 'Test Planning'],
        certifications: ['TVAC Operator Level 2', 'Safety Training'],
        siteIds: [sites[0]._id],
        ratePerHour: 1500,
        isActive: true,
      },
      {
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@e2o.com',
        phone: '+91-9876543211',
        skills: ['Vibration Testing', 'Data Acquisition', 'Test Automation'],
        certifications: ['Vibration Test Engineer', 'LabVIEW Certified'],
        siteIds: [sites[0]._id],
        ratePerHour: 1800,
        isActive: true,
      },
      {
        firstName: 'Arun',
        lastName: 'Reddy',
        email: 'arun.reddy@e2o.com',
        phone: '+91-9876543212',
        skills: ['EMC Testing', 'RF Measurements', 'Antenna Testing'],
        certifications: ['EMC Test Engineer', 'RF Safety'],
        siteIds: [sites[1]._id],
        ratePerHour: 2000,
        isActive: true,
      },
      {
        firstName: 'Sneha',
        lastName: 'Patel',
        email: 'sneha.patel@e2o.com',
        phone: '+91-9876543213',
        skills: ['Cleanroom Operations', 'Assembly Integration', 'Quality Control'],
        certifications: ['Cleanroom Protocol', 'ESD Handling'],
        siteIds: [sites[0]._id],
        ratePerHour: 1200,
        isActive: true,
      },
    ]);

    // 6. Create Platform Admin Organization and User
    console.log('Creating admin organization and user...');
    const adminOrg = new Organization({
      name: 'Earth To Orbit Platform',
      legalName: 'Earth To Orbit Private Limited',
      registrationNumber: 'U74999KA2024PTC999999',
      gstNumber: '29ABCDE1234F1Z5',
      industry: 'Aerospace Services',
      address: {
        street: 'MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560001',
      },
      contactEmail: 'admin@earth-to-orbit.com',
      contactPhone: '+91-80-00000000',
      isActive: true,
      isVerified: true,
    });
    await adminOrg.save();

    const adminPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'Admin@123456',
      10
    );
    const adminUser = new User({
      email: process.env.ADMIN_EMAIL || 'admin@earth-to-orbit.com',
      passwordHash: adminPassword,
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'PLATFORM_ADMIN',
      organizationId: adminOrg._id,
      isActive: true,
      emailVerified: true,
    });
    await adminUser.save();

    // 7. Create Sample Organization and Users
    console.log('Creating sample organization and users...');
    const sampleOrg = new Organization({
      name: 'SpaceTech Innovations Pvt Ltd',
      legalName: 'SpaceTech Innovations Private Limited',
      registrationNumber: 'U74999KA2023PTC123456',
      gstNumber: '29AAACS1234N1Z8',
      industry: 'Satellite Manufacturing',
      description: 'Small satellite manufacturer focused on Earth observation missions',
      address: {
        street: 'Whitefield Main Road',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560066',
      },
      contactEmail: 'contact@spacetech.in',
      contactPhone: '+91-80-12341234',
      website: 'https://spacetech.in',
      isActive: true,
      isVerified: true,
    });
    await sampleOrg.save();

    const sampleOrgAdminPassword = await bcrypt.hash('OrgAdmin@123', 10);
    const sampleOrgAdmin = new User({
      email: 'admin@spacetech.in',
      passwordHash: sampleOrgAdminPassword,
      firstName: 'Vikram',
      lastName: 'Singh',
      phone: '+91-9988776655',
      role: 'ORG_ADMIN',
      organizationId: sampleOrg._id,
      isActive: true,
      emailVerified: true,
    });
    await sampleOrgAdmin.save();

    const sampleMemberPassword = await bcrypt.hash('Member@123', 10);
    const sampleMember = new User({
      email: 'engineer@spacetech.in',
      passwordHash: sampleMemberPassword,
      firstName: 'Ananya',
      lastName: 'Krishnan',
      phone: '+91-9988776656',
      role: 'ORG_MEMBER',
      organizationId: sampleOrg._id,
      isActive: true,
      emailVerified: true,
    });
    await sampleMember.save();

    console.log('\n✅ Database seeded successfully!\n');
    console.log('=== LOGIN CREDENTIALS ===\n');
    console.log('Platform Admin:');
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}\n`);
    console.log('Sample Org Admin:');
    console.log(`  Email: ${sampleOrgAdmin.email}`);
    console.log(`  Password: OrgAdmin@123\n`);
    console.log('Sample Org Member:');
    console.log(`  Email: ${sampleMember.email}`);
    console.log(`  Password: Member@123\n`);
    console.log('======================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
