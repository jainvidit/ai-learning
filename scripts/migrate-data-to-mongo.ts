/**
 * One-off migration: local data/profiles.json + data/progress/*.json -> MongoDB.
 * Requires MONGO_DB_MONGODB_URI in the environment (pull it from Vercel or .env.local).
 * Run: npx tsx scripts/migrate-data-to-mongo.ts
 */
import fs from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";
import type { Profile, ProgressStore } from "../src/lib/schema";

const DATA_DIR = path.join(process.cwd(), "data");
const REGISTRY_PATH = path.join(DATA_DIR, "profiles.json");
const PROGRESS_DIR = path.join(DATA_DIR, "progress");

async function main() {
  const uri = process.env.MONGO_DB_MONGODB_URI;
  if (!uri) {
    console.error("MONGO_DB_MONGODB_URI is not set. Aborting.");
    process.exit(1);
  }

  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`No local profiles.json at ${REGISTRY_PATH}. Nothing to migrate.`);
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8")) as {
    profiles: Profile[];
  };

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("ai-learning");
  const profiles = db.collection<Profile>("profiles");
  const progressColl = db.collection<ProgressStore & { profileId: string }>("progress");

  try {
    for (const profile of registry.profiles) {
      const already = await profiles.findOne({ id: profile.id });
      if (already) {
        console.log(`skip profile ${profile.id} (${profile.name}) — already in MongoDB`);
        continue;
      }

      await profiles.insertOne(profile);
      console.log(`migrated profile ${profile.id} (${profile.name})`);

      const progressPath = path.join(PROGRESS_DIR, `${profile.id}.json`);
      if (fs.existsSync(progressPath)) {
        const progress = JSON.parse(fs.readFileSync(progressPath, "utf-8")) as ProgressStore;
        await progressColl.updateOne(
          { profileId: profile.id },
          { $set: { ...progress, profileId: profile.id } },
          { upsert: true }
        );
        console.log(`  + migrated progress for ${profile.id}`);
      } else {
        console.log(`  (no progress file for ${profile.id})`);
      }
    }
    console.log("Done.");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
