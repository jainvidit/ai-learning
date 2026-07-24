import type { ReactNode, ButtonHTMLAttributes } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  const styles = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-zinc-400",
    secondary:
      "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
    danger: "bg-red-600 text-white hover:bg-red-500",
  }[variant];
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Callout({
  kind = "info",
  children,
}: {
  kind?: "info" | "tip" | "warning";
  children: ReactNode;
}) {
  const styles = {
    info: "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
    tip: "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950",
    warning:
      "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
  }[kind];
  const label = { info: "ℹ️ Note", tip: "💡 Tip", warning: "⚠️ Watch out" }[
    kind
  ];
  return (
    <div className={`my-4 rounded-lg border p-4 text-sm ${styles}`}>
      <div className="mb-1 font-semibold">{label}</div>
      {children}
    </div>
  );
}

export function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
  );
}

export function ProgressRing({ percent }: { percent: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-zinc-500">{percent}%</span>
    </div>
  );
}
