import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from root .env, then apps/api/.env
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, "../apps/api/.env") });

import Request from "../apps/api/src/models/Request";

const MONGODB_URI = process.env.MONGODB_URI;
const ORG_ID = process.env.ORG_ID; // required target organization id
const STATUS = process.env.STATUS; // optional filter by status
const REQUEST_NUMBER = process.env.REQUEST_NUMBER; // optional specific request
const ONLY_NULL = process.env.ONLY_NULL === "true"; // update only where org is null/missing

async function main() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is required in environment");
    }
    if (!ORG_ID) {
      throw new Error("ORG_ID is required in environment");
    }

    console.log("🔧 Reassigning Request.organization to:", ORG_ID);
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const filter: any = {};
    if (ONLY_NULL) {
      filter.$or = [{ organization: { $exists: false } }, { organization: null }];
    }
    if (STATUS) {
      filter.status = STATUS;
    }
    if (REQUEST_NUMBER) {
      filter.requestNumber = REQUEST_NUMBER;
    }

    const total = await Request.countDocuments(filter);
    console.log(`📦 Matched requests: ${total}`);

    const samples = await Request.find(filter)
      .select("_id requestNumber organization status")
      .limit(5);
    console.log("🧾 Sample before:");
    samples.forEach((r) => console.log(r));

    const result = await Request.updateMany(filter, {
      $set: { organization: new mongoose.Types.ObjectId(ORG_ID) },
    });

    console.log(
      `✅ Updated. Matched: ${(result as any).matchedCount ?? "unknown"}, Modified: ${(result as any).modifiedCount ?? "unknown"}`
    );

    const after = await Request.find(filter)
      .select("_id requestNumber organization status")
      .limit(5);
    console.log("🧾 Sample after:");
    after.forEach((r) => console.log(r));

    await mongoose.disconnect();
    console.log("👋 Disconnected");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

main();