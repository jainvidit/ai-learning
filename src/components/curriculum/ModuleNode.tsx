"use client";

import { memo } from "react";
import { Handle, Position } from "reactflow";
import Link from "next/link";
import { getModuleIcon, TRACK_COLORS } from "@/lib/gamification";

// Border colors for each track
const TRACK_BORDER_COLORS = {
  fundamentals: "border-sky-400/80",
  prompting: "border-emerald-400/80",
  "claude-code": "border-violet-400/80",
};

// Glow colors for available nodes
const TRACK_GLOW = {
  fundamentals: "shadow-sky-500/50",
  prompting: "shadow-emerald-500/50",
  "claude-code": "shadow-violet-500/50",
};

interface ModuleNodeProps {
  data: {
    title: string;
    track: "fundamentals" | "prompting" | "claude-code";
    status: "built" | "spec";
    isComplete: boolean;
    isUnlocked: boolean;
    isAccessible: boolean;
    moduleId: string;
  };
}

function ModuleNode({ data }: ModuleNodeProps) {
  const { title, track, status, isComplete, isAccessible, moduleId } = data;
  const icon = getModuleIcon(moduleId);

  // Size variations based on state
  const sizeClasses = isComplete
    ? "w-[200px] h-[90px]"    // Smaller when complete
    : isAccessible
    ? "w-[240px] h-[110px]"   // Larger when available
    : "w-[180px] h-[80px]";   // Smallest when locked

  // Icon size
  const iconSize = isComplete ? "text-3xl" : isAccessible ? "text-4xl" : "text-2xl";

  // Border and glow
  const borderColor = TRACK_BORDER_COLORS[track];
  const glowEffect = isAccessible && !isComplete ? `shadow-xl ${TRACK_GLOW[track]}` : "";

  const content = (
    <div className="relative">
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="!bg-zinc-600" />
      <Handle type="source" position={Position.Bottom} className="!bg-zinc-600" />

      {/* Pulse animation for available nodes */}
      {isAccessible && !isComplete && (
        <div
          className={`absolute inset-0 animate-ping rounded-2xl border-2 ${borderColor} opacity-75`}
        />
      )}

      {/* Main node */}
      <div
        className={`
          relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2
          bg-white/90 p-4 backdrop-blur-sm transition-all duration-300
          dark:bg-zinc-900/90
          ${sizeClasses} ${borderColor} ${glowEffect}
          ${isAccessible ? "hover:scale-110 cursor-pointer" : "opacity-50"}
        `}
      >
        {/* Module icon */}
        <div className={iconSize}>{icon}</div>

        {/* Module title */}
        <div className="text-center text-xs font-bold leading-tight text-zinc-900 dark:text-white">
          {title}
        </div>

        {/* Status badge */}
        {isComplete && (
          <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs text-white shadow-lg">
            ✓
          </div>
        )}
        {!isAccessible && status === "built" && (
          <div className="absolute -right-2 -top-2 text-xl">🔒</div>
        )}
        {status === "spec" && (
          <div className="absolute -bottom-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
            SOON
          </div>
        )}
      </div>
    </div>
  );

  if (isAccessible) {
    return (
      <Link href={`/learn/${moduleId}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export default memo(ModuleNode);
