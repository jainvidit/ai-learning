"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from "reactflow";
import type { ContentBundle } from "@/lib/bundle";
import ModuleNode from "./ModuleNode";
import TrackHeader from "./TrackHeader";
import TreasureNode from "./TreasureNode";
import { isTrackComplete, TRACK_THEMES, TRACK_COLORS } from "@/lib/gamification";
import "reactflow/dist/style.css";

interface DependencyGraphProps {
  bundle: ContentBundle;
  completedModules: Set<string>;
  unlockedModules: Set<string>;
}

const nodeTypes = {
  module: ModuleNode,
  trackHeader: TrackHeader,
  treasure: TreasureNode,
};

// Vertical layout spacing (rotated 90°)
const LANE_WIDTH = 360;   // Width of each track column
const ROW_HEIGHT = 220;   // Vertical spacing between levels
const START_Y = 100;      // Space for track headers

function applyBundleLayout(nodes: Node[], bundle: ContentBundle): Node[] {
  return nodes.map((node) => {
    const bundleNode = bundle.curriculum.nodes.find((n) => n.id === node.id);
    if (!bundleNode) return node;

    // Rotate 90°: lanes become vertical columns, cols become vertical rows
    return {
      ...node,
      position: {
        x: bundleNode.layout.lane * LANE_WIDTH + 50,      // Tracks as columns
        y: bundleNode.layout.col * ROW_HEIGHT + START_Y,  // Top-to-bottom progression
      },
      sourcePosition: Position.Bottom,  // Vertical flow
      targetPosition: Position.Top,
    };
  });
}

export default function DependencyGraph({
  bundle,
  completedModules,
  unlockedModules,
}: DependencyGraphProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const modules = bundle.curriculum.nodes;

    // 1. Create module nodes
    const moduleNodes: Node[] = modules.map((m) => {
      const isComplete = completedModules.has(m.id);
      const isUnlocked = unlockedModules.has(m.id);
      const isAccessible = m.status === "built" && isUnlocked;

      return {
        id: m.id,
        type: "module",
        position: { x: 0, y: 0 }, // Will be set by applyBundleLayout
        data: {
          title: m.title,
          track: m.track,
          status: m.status,
          isComplete,
          isUnlocked,
          isAccessible,
          moduleId: m.id,
        },
      };
    });

    // Apply vertical layout
    const layoutedModules = applyBundleLayout(moduleNodes, bundle);

    // 2. Create track header nodes
    const trackHeaders: Node[] = [
      {
        id: "header-fundamentals",
        type: "trackHeader",
        position: { x: 0 * LANE_WIDTH + 50, y: 20 },
        data: { track: "fundamentals", theme: TRACK_THEMES.fundamentals },
      },
      {
        id: "header-prompting",
        type: "trackHeader",
        position: { x: 1 * LANE_WIDTH + 50, y: 20 },
        data: { track: "prompting", theme: TRACK_THEMES.prompting },
      },
      {
        id: "header-claude-code",
        type: "trackHeader",
        position: { x: 2 * LANE_WIDTH + 50, y: 20 },
        data: { track: "claude-code", theme: TRACK_THEMES["claude-code"] },
      },
    ];

    // 3. Create treasure chest nodes
    const treasureNodes: Node[] = Object.entries(TRACK_THEMES).map(([track, theme], i) => {
      const trackModules = modules.filter((m) => m.track === track);
      const lastCol = Math.max(0, ...trackModules.map((m) => m.layout.col));
      const unlocked = isTrackComplete(bundle, completedModules, track);

      return {
        id: `treasure-${track}`,
        type: "treasure",
        position: {
          x: i * LANE_WIDTH + 50 + 80, // Center in column
          y: (lastCol + 1) * ROW_HEIGHT + START_Y + 40,
        },
        data: { track, unlocked },
      };
    });

    // Combine all nodes
    const allNodes = [...trackHeaders, ...layoutedModules, ...treasureNodes];

    // 4. Create edges with dotted styling
    const edges: Edge[] = [];
    modules.forEach((m) => {
      m.requires.forEach((reqId: string) => {
        const isPrereqComplete = completedModules.has(reqId);
        const edgeColor = isPrereqComplete ? TRACK_COLORS[m.track] : "#4b5563";

        edges.push({
          id: `${reqId}-${m.id}`,
          source: reqId,
          target: m.id,
          type: "step",
          animated: isPrereqComplete && !completedModules.has(m.id),
          style: {
            stroke: edgeColor,
            strokeWidth: isPrereqComplete ? 2 : 1,
            strokeDasharray: "5 5", // Dotted line
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeColor,
          },
        });
      });
    });

    return { nodes: allNodes, edges };
  }, [bundle, completedModules, unlockedModules]);

  const [nodes] = useNodesState(initialNodes);
  const [edges] = useEdgesState(initialEdges);

  return (
    <div className="relative h-[1400px] w-full overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-950">
      {/* Decorative background pattern */}
      <div
        className="absolute inset-0 opacity-10 dark:opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgb(99 102 241) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgb(168 85 247) 0%, transparent 50%)`,
        }}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={1.2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#d4d4d8"
          className="dark:!bg-zinc-900"
          gap={20}
          size={1}
        />
        <Controls className="rounded-lg border border-zinc-300 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" />
        <MiniMap
          className="rounded-lg border-2 border-zinc-300 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          nodeColor={(node) => {
            if (node.type === "treasure") return "#fbbf24"; // amber for treasures
            if (node.type === "trackHeader") return "#6b7280"; // gray for headers
            const data = node.data as any;
            if (data.isComplete) return "#10b981"; // green for complete
            return TRACK_COLORS[data.track] || "#6b7280";
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}
