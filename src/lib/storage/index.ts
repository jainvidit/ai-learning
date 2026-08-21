import type { IProfileStorage, IProgressStorage } from "./interfaces";
import { APIProfileStorage, APIProgressStorage } from "./api-storage";

// Browser storage requires "use client", so we lazy-load it
let browserProfileStorage: IProfileStorage | null = null;
let browserProgressStorage: IProgressStorage | null = null;

function getStorageMode(): "api" | "browser" {
  // Server-side: always use API
  if (typeof window === "undefined") return "api";

  // Browser: check env var or default to "browser"
  const mode = process.env.NEXT_PUBLIC_STORAGE_MODE || "browser";
  return mode as "api" | "browser";
}

export function getProfileStorage(): IProfileStorage {
  const mode = getStorageMode();

  if (mode === "api") {
    return new APIProfileStorage();
  }

  // Browser mode
  if (!browserProfileStorage) {
    const { BrowserProfileStorage } = require("./browser-storage");
    browserProfileStorage = new BrowserProfileStorage();
  }
  return browserProfileStorage;
}

export function getProgressStorage(): IProgressStorage {
  const mode = getStorageMode();

  if (mode === "api") {
    return new APIProgressStorage();
  }

  // Browser mode
  if (!browserProgressStorage) {
    const { BrowserProgressStorage } = require("./browser-storage");
    browserProgressStorage = new BrowserProgressStorage();
  }
  return browserProgressStorage;
}

export type { IProfileStorage, IProgressStorage } from "./interfaces";
