import type { IProfileStorage, IProgressStorage } from "./interfaces";

// Browser storage requires "use client", so we lazy-load it
let browserProfileStorage: IProfileStorage | null = null;
let browserProgressStorage: IProgressStorage | null = null;

// MongoDB storage (server-side only)
let mongoProfileStorage: IProfileStorage | null = null;
let mongoProgressStorage: IProgressStorage | null = null;

// Filesystem storage (server-side only, local dev)
let fileProfileStorage: IProfileStorage | null = null;
let fileProgressStorage: IProgressStorage | null = null;

function getServerStorageMode(): "mongodb" | "filesystem" {
  // On Vercel: use MongoDB if the connection string is present.
  // Locally (no MONGO_DB_MONGODB_URI): use the filesystem, exactly as before.
  return process.env.MONGO_DB_MONGODB_URI ? "mongodb" : "filesystem";
}

export function getProfileStorage(): IProfileStorage {
  // Server-side: never call our own HTTP API from within itself.
  if (typeof window === "undefined") {
    const mode = getServerStorageMode();

    if (mode === "mongodb") {
      if (!mongoProfileStorage) {
        const { MongoDBProfileStorage } = require("./mongodb-storage");
        mongoProfileStorage = new MongoDBProfileStorage();
      }
      return mongoProfileStorage!;
    }

    if (!fileProfileStorage) {
      const { FileProfileStorage } = require("./filesystem-storage");
      fileProfileStorage = new FileProfileStorage();
    }
    return fileProfileStorage!;
  }

  // Browser: localStorage, per-device.
  if (!browserProfileStorage) {
    const { BrowserProfileStorage } = require("./browser-storage");
    browserProfileStorage = new BrowserProfileStorage();
  }
  return browserProfileStorage!;
}

export function getProgressStorage(): IProgressStorage {
  if (typeof window === "undefined") {
    const mode = getServerStorageMode();

    if (mode === "mongodb") {
      if (!mongoProgressStorage) {
        const { MongoDBProgressStorage } = require("./mongodb-storage");
        mongoProgressStorage = new MongoDBProgressStorage();
      }
      return mongoProgressStorage!;
    }

    if (!fileProgressStorage) {
      const { FileProgressStorage } = require("./filesystem-storage");
      fileProgressStorage = new FileProgressStorage();
    }
    return fileProgressStorage!;
  }

  if (!browserProgressStorage) {
    const { BrowserProgressStorage } = require("./browser-storage");
    browserProgressStorage = new BrowserProgressStorage();
  }
  return browserProgressStorage!;
}

export type { IProfileStorage, IProgressStorage } from "./interfaces";
