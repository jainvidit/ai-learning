import type { IProfileStorage, IProgressStorage } from "./interfaces";
import { APIProfileStorage, APIProgressStorage } from "./api-storage";

// Browser storage requires "use client", so we lazy-load it
let browserProfileStorage: IProfileStorage | null = null;
let browserProgressStorage: IProgressStorage | null = null;

// MongoDB storage (server-side only)
let mongoProfileStorage: IProfileStorage | null = null;
let mongoProgressStorage: IProgressStorage | null = null;

function getStorageMode(): "browser" | "mongodb" | "api" {
  // Server-side logic
  if (typeof window === "undefined") {
    // On Vercel: use MongoDB if URI is set (Vercel's env var name)
    if (process.env.MONGO_DB_MONGODB_URI) {
      return "mongodb";
    }
    // Local dev: fall back to API
    return "api";
  }

  // Browser: use browser storage by default
  const mode = process.env.NEXT_PUBLIC_STORAGE_MODE || "browser";
  return mode as "browser" | "api";
}

export function getProfileStorage(): IProfileStorage {
  const mode = getStorageMode();

  if (mode === "mongodb") {
    if (!mongoProfileStorage) {
      const { MongoDBProfileStorage } = require("./mongodb-storage");
      mongoProfileStorage = new MongoDBProfileStorage();
    }
    return mongoProfileStorage!;
  }

  if (mode === "api") {
    return new APIProfileStorage();
  }

  // Browser mode
  if (!browserProfileStorage) {
    const { BrowserProfileStorage } = require("./browser-storage");
    browserProfileStorage = new BrowserProfileStorage();
  }
  return browserProfileStorage!;
}

export function getProgressStorage(): IProgressStorage {
  const mode = getStorageMode();

  if (mode === "mongodb") {
    if (!mongoProgressStorage) {
      const { MongoDBProgressStorage } = require("./mongodb-storage");
      mongoProgressStorage = new MongoDBProgressStorage();
    }
    return mongoProgressStorage!;
  }

  if (mode === "api") {
    return new APIProgressStorage();
  }

  // Browser mode
  if (!browserProgressStorage) {
    const { BrowserProgressStorage } = require("./browser-storage");
    browserProgressStorage = new BrowserProgressStorage();
  }
  return browserProgressStorage!;
}

export type { IProfileStorage, IProgressStorage } from "./interfaces";
