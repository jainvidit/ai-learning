"use client";

import { useEffect, useState } from "react";
import type { ThemePreference } from "@/lib/schema";

type Theme = ThemePreference;

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
}

export default function ThemeToggle({
  profileId,
  profileTheme,
}: {
  /** Active profile's id, so a change can be persisted server-side. Absent when no profile is picked yet. */
  profileId?: string;
  /** Active profile's persisted theme, if any — takes precedence over the localStorage cache. */
  profileTheme?: ThemePreference;
}) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    // The profile's persisted choice (if set) is the source of truth; the
    // localStorage value is just a fast, pre-hydration cache (see layout.tsx).
    const stored =
      profileTheme ?? (localStorage.getItem("theme") as Theme) ?? "system";
    setTheme(stored);
    applyTheme(stored);
    localStorage.setItem("theme", stored);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem("theme") ?? "system") === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
    // profileId intentionally omitted: switching profiles re-mounts Sidebar
    // (and this component) via the server, so a fresh profileTheme prop
    // already triggers this effect.
  }, [profileTheme]);

  function select(next: Theme) {
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
    if (profileId) {
      fetch(`/api/profiles/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: next }),
      }).catch(() => {
        // Best-effort persistence; the local choice already applied above.
      });
    }
  }

  const options: { value: Theme; label: string; title: string }[] = [
    { value: "light", label: "☀️", title: "Light" },
    { value: "system", label: "💻", title: "System" },
    { value: "dark", label: "🌙", title: "Dark" },
  ];

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => select(o.value)}
          title={o.title}
          aria-label={`${o.title} theme`}
          className={`rounded-md px-1.5 py-0.5 text-xs transition-colors ${
            theme === o.value
              ? "bg-zinc-200 dark:bg-zinc-700"
              : "opacity-50 hover:opacity-100"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
