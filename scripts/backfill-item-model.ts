import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from root .env, then fallback to apps/api/.env
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, "../apps/api/.env") });

import Request from "../apps/api/src/models/Request";

const MONGODB_URI = process.env.MONGODB_URI!;

async function backfillItemModel() {
  try {
    console.log("🔧 Starting backfill: itemModel on Request.items...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Use pipeline update to map items array and add itemModel from itemType
    const result = await Request.updateMany({}, [
      {
        $set: {
          items: {
            $map: {
              input: "$items",
              as: "i",
              in: {
                $mergeObjects: [
                  "$$i",
                  {
                    itemModel: {
                      $cond: [
                        { $eq: ["$$i.itemType", "lab"] },
                        "Lab",
                        "Component",
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ] as any);

    console.log(
      `✅ Backfill complete. Matched: ${
        (result as any).matchedCount ?? "unknown"
      }, Modified: ${(result as any).modifiedCount ?? "unknown"}`
    );

    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (err) {
    console.error("❌ Backfill failed:", err);
    process.exit(1);
  }
}

backfillItemModel();
