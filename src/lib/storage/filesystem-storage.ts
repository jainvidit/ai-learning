import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { Profile, ProfileRegistry, ProgressStore } from "@/lib/schema";
import type { IProfileStorage, IProgressStorage } from "./interfaces";
import { emptyProgress } from "@/lib/schema";

const DATA_DIR = path.join(process.cwd(), "data");
const REGISTRY_PATH = path.join(DATA_DIR, "profiles.json");
const PROGRESS_DIR = path.join(DATA_DIR, "progress");

const AVATAR_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

function atomicWrite(filePath: string, data: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, filePath);
}

export class FileProfileStorage implements IProfileStorage {
  async loadRegistry(): Promise<ProfileRegistry> {
    if (!fs.existsSync(REGISTRY_PATH)) return { profiles: [] };
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
  }

  private async saveRegistry(registry: ProfileRegistry): Promise<void> {
    atomicWrite(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  }

  async createProfile(name: string): Promise<Profile> {
    const registry = await this.loadRegistry();
    const profile: Profile = {
      id: crypto.randomUUID().slice(0, 8),
      name: name.trim().slice(0, 40),
      avatarColor:
        AVATAR_COLORS[registry.profiles.length % AVATAR_COLORS.length],
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    registry.profiles.push(profile);
    await this.saveRegistry(registry);
    return profile;
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    const registry = await this.loadRegistry();
    return registry.profiles.find((p) => p.id === id);
  }

  async touchProfile(id: string): Promise<void> {
    const registry = await this.loadRegistry();
    const p = registry.profiles.find((p) => p.id === id);
    if (p) {
      p.lastActiveAt = new Date().toISOString();
      await this.saveRegistry(registry);
    }
  }

  async deleteProfile(id: string): Promise<void> {
    const registry = await this.loadRegistry();
    registry.profiles = registry.profiles.filter((p) => p.id !== id);
    await this.saveRegistry(registry);
    fs.rmSync(path.join(PROGRESS_DIR, `${id}.json`), { force: true });
    fs.rmSync(path.join(process.cwd(), "sandbox", "live", id), {
      recursive: true,
      force: true,
    });
  }
}

export class FileProgressStorage implements IProgressStorage {
  private writeLock: Promise<void> = Promise.resolve();

  private progressPath(profileId: string): string {
    return path.join(PROGRESS_DIR, `${profileId}.json`);
  }

  async loadProgress(profileId: string): Promise<ProgressStore> {
    const p = this.progressPath(profileId);
    if (!fs.existsSync(p)) return emptyProgress();
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  }

  private async save(profileId: string, store: ProgressStore): Promise<void> {
    const p = this.progressPath(profileId);
    atomicWrite(p, JSON.stringify(store, null, 2));
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
