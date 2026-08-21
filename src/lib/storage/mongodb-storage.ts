import crypto from "node:crypto";
import { MongoClient, Db, Collection } from "mongodb";
import type { Profile, ProfileRegistry, ProgressStore } from "@/lib/schema";
import type { IProfileStorage, IProgressStorage } from "./interfaces";
import { emptyProgress } from "@/lib/schema";

const AVATAR_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

let mongoClient: MongoClient | null = null;
let db: Db | null = null;

async function getDatabase(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGO_DB_MONGODB_URI;
  if (!uri) {
    throw new Error("MONGO_DB_MONGODB_URI environment variable not set");
  }

  if (!mongoClient) {
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
  }

  db = mongoClient.db("ai-learning");
  return db;
}

export class MongoDBProfileStorage implements IProfileStorage {
  private async getProfiles(): Promise<Collection<Profile>> {
    const database = await getDatabase();
    return database.collection<Profile>("profiles");
  }

  async loadRegistry(): Promise<ProfileRegistry> {
    try {
      const collection = await this.getProfiles();
      const profiles = await collection.find({}).toArray();
      return {
        profiles: profiles.map(({ _id, ...profile }) => profile),
      };
    } catch (err) {
      console.error("Failed to load profiles from MongoDB:", err);
      return { profiles: [] };
    }
  }

  async createProfile(name: string): Promise<Profile> {
    const collection = await this.getProfiles();
    const registry = await this.loadRegistry();

    const profile: Profile = {
      id: crypto.randomUUID().slice(0, 8),
      name: name.trim().slice(0, 40),
      avatarColor:
        AVATAR_COLORS[registry.profiles.length % AVATAR_COLORS.length],
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    await collection.insertOne(profile);
    return profile;
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    const collection = await this.getProfiles();
    const profile = await collection.findOne({ id } as Partial<Profile>);
    if (!profile) return undefined;
    const { _id, ...rest } = profile;
    return rest;
  }

  async touchProfile(id: string): Promise<void> {
    const collection = await this.getProfiles();
    await collection.updateOne(
      { id },
      { $set: { lastActiveAt: new Date().toISOString() } }
    );
  }

  async deleteProfile(id: string): Promise<void> {
    const collection = await this.getProfiles();
    await collection.deleteOne({ id });

    // Also delete progress for this profile
    const database = await getDatabase();
    const progressCollection = database.collection("progress");
    await progressCollection.deleteMany({ profileId: id });
  }
}

type ProgressDoc = ProgressStore & { profileId: string };

export class MongoDBProgressStorage implements IProgressStorage {
  private writeLock: Promise<void> = Promise.resolve();

  private async getProgressCollection(): Promise<Collection<ProgressDoc>> {
    const database = await getDatabase();
    return database.collection<ProgressDoc>("progress");
  }

  async loadProgress(profileId: string): Promise<ProgressStore> {
    try {
      const collection = await this.getProgressCollection();
      const doc = await collection.findOne({ profileId } as Partial<ProgressDoc>);
      if (!doc) return emptyProgress();

      const { _id, profileId: _pid, ...progressData } = doc;
      return progressData as ProgressStore;
    } catch (err) {
      console.error(
        `Failed to load progress from MongoDB for profile ${profileId}:`,
        err
      );
      return emptyProgress();
    }
  }

  private async save(profileId: string, store: ProgressStore): Promise<void> {
    try {
      const collection = await this.getProgressCollection();
      await collection.updateOne(
        { profileId } as Partial<ProgressDoc>,
        { $set: { ...store, profileId } },
        { upsert: true }
      );
    } catch (err) {
      console.error(
        `Failed to save progress to MongoDB for profile ${profileId}:`,
        err
      );
    }
  }

  async updateProgress(
    profileId: string,
    mutate: (store: ProgressStore) => void
  ): Promise<ProgressStore> {
    const result = this.writeLock.then(async () => {
      const store = await this.loadProgress(profileId);
      mutate(store);
      await this.save(profileId, store);
      return store;
    });
    this.writeLock = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  }
}
