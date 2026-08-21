import type { ContentBundle } from "./bundle";

/**
 * Check if all built modules in a track are complete
 */
export function isTrackComplete(
  bundle: ContentBundle,
  completedModules: Set<string>,
  track: string
): boolean {
  const trackModules = bundle.curriculum.nodes.filter(
    (m) => m.track === track && m.status === "built"
  );
  if (trackModules.length === 0) return false;
  return trackModules.every((m) => completedModules.has(m.id));
}

/**
 * Get a representative emoji icon for a module
 */
export function getModuleIcon(moduleId: string): string {
  const icons: Record<string, string> = {
    "01-how-llms-work": "🧠",
    "02-prompting-basics": "💬",
    "03-capabilities-limits": "⚖️",
    "04-core-prompt-techniques": "🎯",
    "05-meet-claude-code": "👋",
    "06-advanced-prompting": "✨",
    "07-claude-code-workflows": "⚙️",
    "08-how-ai-systems-are-built": "🏗️",
    "09-claude-code-power-tools": "🔧",
    "10-context-engineering": "🎨",
    "11-agentic-claude-code": "🤖",
    "12-autonomous-remote-claude": "🚀",
    "13-prompt-mastery": "👑",
    "14-capstone": "🎓",
    "15-ai-for-analytics": "📊",
  };
  return icons[moduleId] || "📦";
}

/**
 * Track theme configuration
 */
export interface TrackTheme {
  name: string;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
}

export const TRACK_THEMES: Record<string, TrackTheme> = {
  fundamentals: {
    name: "Foundation Realm",
    icon: "🏛️",
    gradientFrom: "rgb(59 130 246)",  // blue-500
    gradientTo: "rgb(6 182 212)",     // cyan-500
  },
  prompting: {
    name: "Mastery Path",
    icon: "✨",
    gradientFrom: "rgb(16 185 129)",  // emerald-500
    gradientTo: "rgb(34 197 94)",     // green-500
  },
  "claude-code": {
    name: "Expert Domain",
    icon: "⚡",
    gradientFrom: "rgb(139 92 246)",  // violet-500
    gradientTo: "rgb(168 85 247)",    // purple-500
  },
};

/**
 * Track color mapping for edges and highlights
 */
export const TRACK_COLORS: Record<string, string> = {
  fundamentals: "#38bdf8",  // sky-400
  prompting: "#34d399",     // emerald-400
  "claude-code": "#a78bfa", // violet-400
};
