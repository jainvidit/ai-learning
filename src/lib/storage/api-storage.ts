import type { Profile, ProfileRegistry, ProgressStore } from "@/lib/schema";
import type { IProfileStorage, IProgressStorage } from "./interfaces";

export class APIProfileStorage implements IProfileStorage {
  async loadRegistry(): Promise<ProfileRegistry> {
    const res = await fetch("/api/profiles");
    if (!res.ok) throw new Error(`Failed to load profiles: ${res.status}`);
    const data = await res.json();
    return { profiles: data.profiles };
  }

  async createProfile(name: string): Promise<Profile> {
    const res = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`Failed to create profile: ${res.status}`);
    const data = await res.json();
    return data.profile;
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
      // Note: In real implementation, would persist back to server
    }
  }

  async deleteProfile(id: string): Promise<void> {
    const res = await fetch(`/api/profiles/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete profile: ${res.status}`);
  }
}

export class APIProgressStorage implements IProgressStorage {
  async loadProgress(profileId: string): Promise<ProgressStore> {
    const res = await fetch("/api/progress");
    if (!res.ok) throw new Error(`Failed to load progress: ${res.status}`);
    const data = await res.json();
    return data.progress;
  }

  async updateProgress(
    profileId: string,
    mutate: (store: ProgressStore) => void
  ): Promise<ProgressStore> {
    const current = await this.loadProgress(profileId);
    mutate(current);
    const res = await fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessons: current.lessons }),
    });
    if (!res.ok) throw new Error(`Failed to update progress: ${res.status}`);
    const data = await res.json();
    return data.progress;
  }
}
