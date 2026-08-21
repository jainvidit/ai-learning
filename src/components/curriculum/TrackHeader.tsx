"use client";

import { memo } from "react";
import type { TrackTheme } from "@/lib/gamification";

interface TrackHeaderProps {
  data: {
    track: string;
    theme: TrackTheme;
  };
}

function TrackHeader({ data }: TrackHeaderProps) {
  const { theme } = data;

  return (
    <div
      className="w-[280px] rounded-xl p-4 text-center shadow-2xl backdrop-blur-sm"
      style={{
        backgroundImage: `linear-gradient(to bottom, ${theme.gradientFrom}, ${theme.gradientTo})`,
      }}
    >
      <div className="mb-2 text-4xl">{theme.icon}</div>
      <div className="text-xl font-bold text-white drop-shadow-lg">
        {theme.name}
      </div>
    </div>
  );
}

export default memo(TrackHeader);
