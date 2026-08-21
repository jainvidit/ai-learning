"use client";

import type { Profile, ProfileRegistry, ProgressStore, ThemePreference } from "@/lib/schema";
import type { IProfileStorage, IProgressStorage } from "./interfaces";
import { emptyProgress } from "@/lib/schema";
import { buildNewProfile, createWriteQueue } from "./shared";

const PROFILES_KEY = "ai-learning:profiles";
const PROGRESS_KEY = "ai-learning:progress";

export class BrowserProfileStorage implements IProfileStorage {
  async loadRegistry(): Promise<ProfileRegistry> {
    try {
      const data = localStorage.getItem(PROFILES_KEY);
      if (!data) return { profiles: [] };
      return JSON.parse(data);
    } catch {
      return { profiles: [] };
    }
  }

  private async saveRegistry(registry: ProfileRegistry): Promise<void> {
    try {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(registry));
    } catch (err) {
      console.error("Failed to save profiles:", err);
    }
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
    const profile = registry.profiles.find((p) => p.id === id);
    if (profile) {
      profile.lastActiveAt = new Date().toISOString();
      await this.saveRegistry(registry);
    }
  }

  async setProfileTheme(id: string, theme: ThemePreference): Promise<void> {
    const registry = await this.loadRegistry();
    const profile = registry.profiles.find((p) => p.id === id);
    if (profile) {
      profile.theme = theme;
      await this.saveRegistry(registry);
    }
  }

  async deleteProfile(id: string): Promise<void> {
    const registry = await this.loadRegistry();
    registry.profiles = registry.profiles.filter((p) => p.id !== id);
    await this.saveRegistry(registry);
    // Also remove progress for this profile
    const progress = await this.loadAllProgress();
    delete progress[id];
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (err) {
      console.error("Failed to delete profile progress:", err);
    }
  }

  private async loadAllProgress(): Promise<Record<string, ProgressStore>> {
    try {
      const data = localStorage.getItem(PROGRESS_KEY);
      if (!data) return {};
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
}

export class BrowserProgressStorage implements IProgressStorage {
  private readonly enqueue = createWriteQueue();

  private progressKey(profileId: string): string {
    return `${PROGRESS_KEY}:${profileId}`;
  }

  async loadProgress(profileId: string): Promise<ProgressStore> {
    try {
      const data = localStorage.getItem(this.progressKey(profileId));
      if (!data) return emptyProgress();
      return JSON.parse(data);
    } catch {
      return emptyProgress();
    }
  }

  private async save(profileId: string, store: ProgressStore): Promise<void> {
    try {
      localStorage.setItem(this.progressKey(profileId), JSON.stringify(store));
    } catch (err) {
      console.error(
        `Failed to save progress for profile ${profileId}:`,
        err
      );
    }
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
