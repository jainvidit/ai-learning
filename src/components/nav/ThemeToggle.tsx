"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme) ?? "system";
    setTheme(stored);
    applyTheme(stored);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem("theme") ?? "system") === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function select(next: Theme) {
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
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
