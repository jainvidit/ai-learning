"use client";

import { memo } from "react";

interface TreasureNodeProps {
  data: {
    track: string;
    unlocked: boolean;
  };
}

function TreasureNode({ data }: TreasureNodeProps) {
  const { unlocked } = data;

  return (
    <div
      className={`flex h-24 w-24 items-center justify-center rounded-full transition-all duration-500 ${
        unlocked
          ? "animate-bounce text-7xl drop-shadow-2xl"
          : "text-5xl opacity-30 grayscale"
      }`}
    >
      {unlocked ? "🏆" : "🔒"}
    </div>
  );
}

export default memo(TreasureNode);
