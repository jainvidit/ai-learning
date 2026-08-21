import fs from "node:fs";
import path from "node:path";
import type { Profile, ProfileRegistry, ProgressStore, ThemePreference } from "@/lib/schema";
import type { IProfileStorage, IProgressStorage } from "./interfaces";
import { emptyProgress } from "@/lib/schema";
import { buildNewProfile, createWriteQueue } from "./shared";

const DATA_DIR = path.join(process.cwd(), "data");
const REGISTRY_PATH = path.join(DATA_DIR, "profiles.json");
const PROGRESS_DIR = path.join(DATA_DIR, "progress");

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
    const profile = buildNewProfile(name, registry.profiles.length);
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

  async setProfileTheme(id: string, theme: ThemePreference): Promise<void> {
    const registry = await this.loadRegistry();
    const p = registry.profiles.find((p) => p.id === id);
    if (p) {
      p.theme = theme;
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
  private readonly enqueue = createWriteQueue();

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
    return this.enqueue(async () => {
      const store = await this.loadProgress(profileId);
      mutate(store);
      await this.save(profileId, store);
      return store;
    });
  }
}
