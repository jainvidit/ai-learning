import type { Profile, ProfileRegistry, ProgressStore, ThemePreference } from "@/lib/schema";

export interface IProfileStorage {
  loadRegistry(): Promise<ProfileRegistry>;
  createProfile(name: string): Promise<Profile>;
  getProfile(id: string): Promise<Profile | undefined>;
  touchProfile(id: string): Promise<void>;
  deleteProfile(id: string): Promise<void>;
  setProfileTheme(id: string, theme: ThemePreference): Promise<void>;
}

export interface IProgressStorage {
  loadProgress(profileId: string): Promise<ProgressStore>;
  updateProgress(
    profileId: string,
    mutate: (store: ProgressStore) => void
  ): Promise<ProgressStore>;
}
