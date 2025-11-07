import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, "../apps/api/.env") });

import Request, { RequestStatus } from "../apps/api/src/models/Request";

const MONGODB_URI = process.env.MONGODB_URI!;

async function main() {
  try {
    console.log("🔎 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected");

    const total = await Request.countDocuments();
    console.log(`📦 Total requests: ${total}`);

    // Count by status
    const statuses = Object.values(RequestStatus);
    for (const status of statuses) {
      const count = await Request.countDocuments({ status });
      console.log(`   - ${status}: ${count}`);
    }

    // Group by organization
    const byOrg = await Request.aggregate([
      { $group: { _id: "$organization", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    console.log("🏢 By organization:");
    byOrg.forEach((o) => console.log(`   - ${o._id}: ${o.count}`));

    // Show a few sample docs
    const samples = await Request.find({})
      .select("_id requestNumber organization status createdAt")
      .limit(5);
    console.log("🧾 Sample docs:");
    samples.forEach((r) => console.log(r));

    await mongoose.disconnect();
    console.log("👋 Disconnected");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

main();
