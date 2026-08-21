"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui";

interface ProfileWithCompletion {
  id: string;
  name: string;
  avatarColor: string;
  createdAt: string;
  lastActiveAt: string;
  completion: number;
}

export default function ProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<ProfileWithCompletion[] | null>(
    null
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(
    () =>
      fetch("/api/profiles")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setProfiles(data.profiles);
          setActiveId(data.activeId ?? null);
        })
        .catch(() => setError("Could not load profiles.")),
    []
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function selectProfile(id: string) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/profiles/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.push("/");
      router.refresh();
    } catch {
      setError("Could not switch profile.");
      setBusy(false);
    }
  }

  async function createProfile() {
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.push("/");
      router.refresh();
    } catch {
      setError("Could not create profile.");
      setBusy(false);
    }
  }

  async function removeProfile(profile: ProfileWithCompletion) {
    if (!confirm(`Delete profile "${profile.name}" and all its progress?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/profiles/${profile.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await refresh();
    } catch {
      setError("Could not delete profile.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="text-center text-3xl font-bold">Who&apos;s learning?</h1>
      <p className="mt-2 text-center text-zinc-500">
        Pick a profile to continue, or create a new one.
      </p>

      {error && (
        <p className="mt-4 text-center text-sm text-red-600">{error}</p>
      )}

      {profiles === null ? (
        <div className="mt-12 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {profiles.map((p) => (
            <div key={p.id} className="group relative">
              <button
                onClick={() => selectProfile(p.id)}
                disabled={busy}
                className={`flex w-36 flex-col items-center gap-3 rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-900 ${
                  p.id === activeId
                    ? "border-2 border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900"
                    : "border-zinc-200 hover:border-indigo-400 dark:border-zinc-800 dark:hover:border-indigo-500"
                }`}
              >
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
                  style={{ backgroundColor: p.avatarColor }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-full truncate text-sm font-semibold">
                  {p.name}
                </span>
                <span className="text-xs text-zinc-500">
                  {p.completion}% complete
                </span>
                {p.id === activeId && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Active
                  </span>
                )}
              </button>
              <button
                onClick={() => removeProfile(p)}
                aria-label={`Delete ${p.name}`}
                title="Delete profile"
                className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-sm text-zinc-600 hover:bg-red-600 hover:text-white group-hover:flex dark:bg-zinc-700 dark:text-zinc-300"
              >
                &times;
              </button>
            </div>
          ))}

          {creating ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createProfile();
              }}
              className="flex w-36 flex-col items-center gap-3 rounded-xl border border-dashed border-indigo-400 bg-white p-5 shadow-sm dark:bg-zinc-900"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-2xl font-bold text-zinc-400 dark:bg-zinc-800">
                {newName.trim() ? newName.trim().charAt(0).toUpperCase() : "?"}
              </span>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setCreating(false);
                    setNewName("");
                  }
                }}
                placeholder="Name"
                maxLength={40}
                className="w-full rounded-lg border border-zinc-300 bg-transparent px-2 py-1 text-center text-sm outline-none focus:border-indigo-500 dark:border-zinc-700"
              />
              <button
                type="submit"
                disabled={!newName.trim() || busy}
                className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {busy ? "Creating…" : "Create"}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex w-36 flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 p-5 text-zinc-500 transition-all hover:border-indigo-400 hover:text-indigo-600 dark:border-zinc-700 dark:hover:border-indigo-500"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-3xl font-light dark:bg-zinc-800">
                +
              </span>
              <span className="text-sm font-semibold">New profile</span>
              <span className="text-xs text-zinc-400">Start fresh</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
