import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

import User, { UserRole } from "../apps/api/src/models/User";
import Organization, {
  OrganizationType,
} from "../apps/api/src/models/Organization";
import Category from "../apps/api/src/models/Category";
import Site from "../apps/api/src/models/Site";
import Lab from "../apps/api/src/models/Lab";
import Component from "../apps/api/src/models/Component";
import Staff from "../apps/api/src/models/Staff";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/earth-to-orbit";

/**
 * Seed database with initial data
 */
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...\n");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Category.deleteMany({}),
      Site.deleteMany({}),
      Lab.deleteMany({}),
      Component.deleteMany({}),
      Staff.deleteMany({}),
    ]);
    console.log("✅ Existing data cleared\n");

    // Create Platform Admin
    console.log("👤 Creating platform admin...");
    const platformAdmin = await User.create({
      email:
        process.env.DEMO_PLATFORM_ADMIN_EMAIL || "admin@earth-to-orbit.com",
      password: process.env.DEMO_PLATFORM_ADMIN_PASSWORD || "Admin@123456",
      firstName: "Platform",
      lastName: "Admin",
      role: UserRole.PLATFORM_ADMIN,
    });
    console.log(`✅ Platform admin created: ${platformAdmin.email}\n`);

    // Create Categories
    console.log("📂 Creating categories...");
    const categories = await Category.insertMany([
      {
        name: "Testing & Simulation",
        slug: "testing-simulation",
        description: "Environmental testing and simulation facilities",
        icon: "test-tube",
      },
      {
        name: "Manufacturing",
        slug: "manufacturing",
        description: "Precision manufacturing equipment",
        icon: "cog",
      },
      {
        name: "Electronics",
        slug: "electronics",
        description: "Electronic components and systems",
        icon: "microchip",
      },
      {
        name: "Power Systems",
        slug: "power-systems",
        description: "Power generation and distribution",
        icon: "battery",
      },
      {
        name: "Communication",
        slug: "communication",
        description: "Communication systems and antennas",
        icon: "signal",
      },
    ]);
    console.log(`✅ Created ${categories.length} categories\n`);

    // Create Sites
    console.log("🏢 Creating sites...");
    const sites = await Site.insertMany([
      {
        name: "Bangalore Space Research Center",
        location: {
          city: "Bangalore",
          state: "Karnataka",
          country: "India",
          address: "Electronic City, Bangalore, Karnataka 560100",
          coordinates: {
            latitude: 12.8456,
            longitude: 77.6632,
          },
        },
        facilities: [
          "TVAC Chamber",
          "Vibration Test",
          "Clean Room",
          "PCB Manufacturing",
        ],
        contactEmail: "bangalore@earth-to-orbit.com",
        contactPhone: "+91-80-4567-8900",
        operatingHours: {
          monday: "9:00 AM - 6:00 PM",
          tuesday: "9:00 AM - 6:00 PM",
          wednesday: "9:00 AM - 6:00 PM",
          thursday: "9:00 AM - 6:00 PM",
          friday: "9:00 AM - 6:00 PM",
          saturday: "10:00 AM - 4:00 PM",
        },
      },
      {
        name: "Chennai Aerospace Facility",
        location: {
          city: "Chennai",
          state: "Tamil Nadu",
          country: "India",
          address: "Sriperumbudur, Chennai, Tamil Nadu 602105",
          coordinates: {
            latitude: 12.9635,
            longitude: 79.9754,
          },
        },
        facilities: [
          "EMI/EMC Testing",
          "Shock Test",
          "Thermal Cycling",
          "3D Printing",
        ],
        contactEmail: "chennai@earth-to-orbit.com",
        contactPhone: "+91-44-2345-6789",
        operatingHours: {
          monday: "9:00 AM - 6:00 PM",
          tuesday: "9:00 AM - 6:00 PM",
          wednesday: "9:00 AM - 6:00 PM",
          thursday: "9:00 AM - 6:00 PM",
          friday: "9:00 AM - 6:00 PM",
        },
      },
    ]);
    console.log(`✅ Created ${sites.length} sites\n`);

    // Create Labs
    console.log("🔬 Creating labs...");
    const labs = await Lab.insertMany([
      {
        name: "TVAC Chamber (Large)",
        category: categories[0]._id,
        site: sites[0]._id,
        description:
          "Large Thermal Vacuum Chamber for full satellite environmental testing. Simulates the extreme conditions of space including temperature variations and vacuum pressure.",
        specifications: new Map([
          ["Chamber Size", "3m x 3m x 4m"],
          ["Temperature Range", "-180°C to +150°C"],
          ["Vacuum Level", "10⁻⁶ Torr"],
          ["Heating/Cooling Rate", "5°C/min"],
          ["Solar Simulation", "Yes (1.2 Solar Constants)"],
        ]),
        capacity: {
          maxPayloadSize: "2.5m x 2.5m x 3.5m",
          maxPayloadWeight: "500 kg",
          temperatureRange: "-180°C to +150°C",
          vacuumLevel: "10⁻⁶ Torr",
        },
        pricePerDay: 150000,
        pricePerWeek: 900000,
        pricePerMonth: 3000000,
        availability: true,
        leadTimeDays: 14,
      },
      {
        name: "Vibration Test System",
        category: categories[0]._id,
        site: sites[0]._id,
        description:
          "High-performance vibration test system for launch simulation. Tests structural integrity and resonance characteristics under dynamic loading conditions.",
        specifications: new Map([
          ["Max Force", "50 kN"],
          ["Frequency Range", "5 Hz to 2000 Hz"],
          ["Max Displacement", "51 mm peak-to-peak"],
          ["Max Acceleration", "100 g"],
          ["Control Axes", "3-axis (X, Y, Z)"],
        ]),
        capacity: {
          maxPayloadWeight: "300 kg",
          frequency: "5 Hz - 2000 Hz",
        },
        pricePerDay: 80000,
        pricePerWeek: 480000,
        pricePerMonth: 1600000,
        availability: true,
        leadTimeDays: 7,
      },
      {
        name: "EMI/EMC Test Chamber",
        category: categories[0]._id,
        site: sites[1]._id,
        description:
          "Electromagnetic Interference and Compatibility testing facility. Ensures your satellite components meet international EMC standards and will not interfere with other systems.",
        specifications: new Map([
          ["Chamber Size", "6m x 4m x 4m"],
          ["Frequency Range", "10 kHz to 40 GHz"],
          ["Shielding Effectiveness", ">100 dB"],
          ["Test Standards", "MIL-STD-461, DO-160"],
        ]),
        capacity: {
          maxPayloadSize: "5m x 3m x 3m",
        },
        pricePerDay: 100000,
        pricePerWeek: 600000,
        pricePerMonth: 2000000,
        availability: true,
        leadTimeDays: 10,
      },
      {
        name: "Shock Test Facility",
        category: categories[0]._id,
        site: sites[1]._id,
        description:
          "Pyroshock and mechanical shock testing facility. Simulates the intense shock pulses experienced during stage separation and other pyrotechnic events.",
        specifications: new Map([
          ["Peak Acceleration", "10,000 g"],
          ["Pulse Duration", "0.5 - 5 ms"],
          ["Max Payload", "100 kg"],
        ]),
        capacity: {
          maxPayloadWeight: "100 kg",
        },
        pricePerDay: 60000,
        pricePerWeek: 360000,
        pricePerMonth: 1200000,
        availability: true,
        leadTimeDays: 7,
      },
      {
        name: "Clean Room (Class 100)",
        category: categories[1]._id,
        site: sites[0]._id,
        description:
          "ISO Class 5 (Class 100) cleanroom for satellite assembly and integration. Temperature and humidity controlled environment with HEPA filtration.",
        specifications: new Map([
          ["Cleanliness Class", "ISO Class 5 (Class 100)"],
          ["Area", "200 sq m"],
          ["Temperature Control", "20°C ± 2°C"],
          ["Humidity Control", "45% ± 5% RH"],
          ["Air Changes", "600+ per hour"],
        ]),
        capacity: {
          maxPayloadSize: "10m x 10m floor space",
        },
        pricePerDay: 40000,
        pricePerWeek: 240000,
        pricePerMonth: 800000,
        availability: true,
        leadTimeDays: 5,
      },
    ]);
    console.log(`✅ Created ${labs.length} labs\n`);

    // Create Components
    console.log("⚙️  Creating components...");
    const components = await Component.insertMany([
      {
        name: "Star Tracker",
        category: categories[2]._id,
        site: sites[0]._id,
        description:
          "High-precision star tracker for attitude determination. Provides sub-arcsecond accuracy for precise satellite orientation.",
        specifications: new Map([
          ["Accuracy", "< 10 arcsec (3σ)"],
          ["Update Rate", "10 Hz"],
          ["Field of View", "20° x 20°"],
          ["Mass", "800 g"],
          ["Power Consumption", "3 W"],
        ]),
        manufacturer: "Jena-Optronik",
        model: "ASTRO-15",
        pricePerDay: 5000,
        pricePerWeek: 30000,
        pricePerMonth: 100000,
        quantity: 5,
        availableQuantity: 5,
      },
      {
        name: "Reaction Wheel",
        category: categories[2]._id,
        site: sites[0]._id,
        description:
          "Precision reaction wheel for three-axis attitude control. Provides fine pointing control and momentum storage.",
        specifications: new Map([
          ["Max Torque", "50 mNm"],
          ["Max Momentum", "5 Nms"],
          ["Speed Range", "0 - 6000 RPM"],
          ["Mass", "2.5 kg"],
          ["Power", "10 W (nominal)"],
        ]),
        manufacturer: "Hyperion Technologies",
        model: "RW-50",
        pricePerDay: 8000,
        pricePerWeek: 48000,
        pricePerMonth: 160000,
        quantity: 10,
        availableQuantity: 10,
      },
      {
        name: "Solar Panel (100W)",
        category: categories[3]._id,
        site: sites[0]._id,
        description:
          "Triple-junction GaAs solar panel with 30% efficiency. Radiation hardened for 15-year mission life.",
        specifications: new Map([
          ["Power Output", "100 W BOL"],
          ["Efficiency", "30%"],
          ["Dimensions", "1000mm x 500mm"],
          ["Mass", "2 kg"],
          ["Operating Temperature", "-100°C to +120°C"],
        ]),
        manufacturer: "Spectrolab",
        model: "XTJ Prime",
        pricePerDay: 3000,
        pricePerWeek: 18000,
        pricePerMonth: 60000,
        quantity: 20,
        availableQuantity: 20,
      },
      {
        name: "S-Band Transceiver",
        category: categories[4]._id,
        site: sites[1]._id,
        description:
          "S-Band transceiver for telemetry, tracking, and command. Compatible with major ground station networks worldwide.",
        specifications: new Map([
          ["Frequency", "2.2 - 2.3 GHz"],
          ["Data Rate", "Up to 2 Mbps"],
          ["Transmit Power", "5 W"],
          ["Receiver Sensitivity", "-110 dBm"],
          ["Mass", "1.2 kg"],
        ]),
        manufacturer: "ISIS",
        model: "TRXVU-S",
        pricePerDay: 6000,
        pricePerWeek: 36000,
        pricePerMonth: 120000,
        quantity: 8,
        availableQuantity: 8,
      },
      {
        name: "Li-Ion Battery (40Ah)",
        category: categories[3]._id,
        site: sites[0]._id,
        description:
          "High-capacity lithium-ion battery for satellite power storage. Optimized for deep discharge cycles and long mission life.",
        specifications: new Map([
          ["Capacity", "40 Ah"],
          ["Voltage", "28 V nominal"],
          ["Energy", "1120 Wh"],
          ["Mass", "8 kg"],
          ["Cycle Life", "> 40,000 cycles"],
        ]),
        manufacturer: "Saft",
        model: "VES-180",
        pricePerDay: 4000,
        pricePerWeek: 24000,
        pricePerMonth: 80000,
        quantity: 15,
        availableQuantity: 15,
      },
      {
        name: "GPS Receiver",
        category: categories[2]._id,
        site: sites[1]._id,
        description:
          "Space-qualified GPS receiver for orbit determination and time synchronization.",
        specifications: new Map([
          ["Accuracy", "< 5 m (3D position)"],
          ["Channels", "24 parallel"],
          ["Update Rate", "1 Hz"],
          ["Power", "2 W"],
          ["Mass", "300 g"],
        ]),
        manufacturer: "NovAtel",
        model: "OEM719",
        pricePerDay: 3500,
        pricePerWeek: 21000,
        pricePerMonth: 70000,
        quantity: 12,
        availableQuantity: 12,
      },
    ]);
    console.log(`✅ Created ${components.length} components\n`);

    // Create Staff
    console.log("👥 Creating staff...");
    const staff = await Staff.insertMany([
      {
        firstName: "Rajesh",
        lastName: "Kumar",
        email: "rajesh.kumar@earth-to-orbit.com",
        phone: "+91-98765-43210",
        site: sites[0]._id,
        role: "Test Engineer",
        department: "Environmental Testing",
        expertise: ["TVAC Testing", "Vibration Testing", "Test Planning"],
      },
      {
        firstName: "Priya",
        lastName: "Sharma",
        email: "priya.sharma@earth-to-orbit.com",
        phone: "+91-98765-43211",
        site: sites[0]._id,
        role: "Cleanroom Supervisor",
        department: "Integration",
        expertise: [
          "Satellite Assembly",
          "Cleanroom Operations",
          "Quality Control",
        ],
      },
      {
        firstName: "Arjun",
        lastName: "Reddy",
        email: "arjun.reddy@earth-to-orbit.com",
        phone: "+91-98765-43212",
        site: sites[1]._id,
        role: "EMC Test Specialist",
        department: "EMI/EMC Testing",
        expertise: ["EMC Testing", "MIL-STD-461", "Test Automation"],
      },
      {
        firstName: "Anjali",
        lastName: "Patel",
        email: "anjali.patel@earth-to-orbit.com",
        phone: "+91-98765-43213",
        site: sites[1]._id,
        role: "Mechanical Test Engineer",
        department: "Mechanical Testing",
        expertise: ["Shock Testing", "Modal Analysis", "Structural Testing"],
      },
    ]);
    console.log(`✅ Created ${staff.length} staff members\n`);

    // Create Demo Organization and Users
    console.log("🏢 Creating demo organization and users...");
    const demoOrg = await Organization.create({
      name: "SpaceTech Innovations",
      legalName: "SpaceTech Innovations Private Limited",
      type: OrganizationType.STARTUP,
      registrationNumber: "U74900KA2020PTC123456",
      gst: "29AABCS1234F1Z5",
      pan: "AABCS1234F",
      email: process.env.DEMO_ORG_EMAIL || "contact@spacetech.in",
      phone: "+91-98765-00000",
      website: "https://spacetech.in",
      address: {
        street: "123, Sector 5, HSR Layout",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        postalCode: "560102",
      },
      isVerified: true,
      verifiedAt: new Date(),
    });

    const orgAdmin = await User.create({
      email: process.env.DEMO_ORG_ADMIN_EMAIL || "admin@spacetech.in",
      password: process.env.DEMO_ORG_ADMIN_PASSWORD || "OrgAdmin@123",
      firstName: "Vikram",
      lastName: "Singh",
      phone: "+91-98765-11111",
      role: UserRole.ORG_ADMIN,
      organization: demoOrg._id,
    });

    const orgMember = await User.create({
      email: process.env.DEMO_ORG_MEMBER_EMAIL || "engineer@spacetech.in",
      password: process.env.DEMO_ORG_MEMBER_PASSWORD || "Member@123",
      firstName: "Neha",
      lastName: "Gupta",
      phone: "+91-98765-22222",
      role: UserRole.ORG_MEMBER,
      organization: demoOrg._id,
    });

    console.log(`✅ Created demo organization: ${demoOrg.name}`);
    console.log(`✅ Created org admin: ${orgAdmin.email}`);
    console.log(`✅ Created org member: ${orgMember.email}\n`);

    // Summary
    console.log("✨ Database seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Platform Admin: 1`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Sites: ${sites.length}`);
    console.log(`   - Labs: ${labs.length}`);
    console.log(`   - Components: ${components.length}`);
    console.log(`   - Staff: ${staff.length}`);
    console.log(`   - Organizations: 1`);
    console.log(`   - Users: 2 (+ 1 platform admin)\n`);

    console.log("🔐 Demo Credentials:");
    console.log(
      `   Platform Admin: ${platformAdmin.email} / ${
        process.env.DEMO_PLATFORM_ADMIN_PASSWORD || "Admin@123456"
      }`
    );
    console.log(
      `   Org Admin: ${orgAdmin.email} / ${
        process.env.DEMO_ORG_ADMIN_PASSWORD || "OrgAdmin@123"
      }`
    );
    console.log(
      `   Org Member: ${orgMember.email} / ${
        process.env.DEMO_ORG_MEMBER_PASSWORD || "Member@123"
      }\n`
    );

    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed script
seedDatabase();
