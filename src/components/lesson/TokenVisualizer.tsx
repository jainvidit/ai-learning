"use client";

import { useMemo, useState } from "react";
import { Button, Card } from "@/components/ui";

/**
 * Splits text into token-like chunks. This is a SIMPLIFIED SIMULATION for
 * teaching — real tokenizers (like the ones used by Claude or GPT models)
 * use learned vocabularies and split differently. The spirit is the same:
 * common short words stay whole, long/rare words break into pieces.
 */
function simulateTokens(text: string): string[] {
  const tokens: string[] = [];
  // Split into words, whitespace runs, and individual punctuation/symbols.
  const pieces = text.match(/[A-Za-z]+|\d+|\s+|[^A-Za-z\d\s]/g) ?? [];
  for (const piece of pieces) {
    if (/^\s+$/.test(piece)) continue; // whitespace rides along with the next word in real tokenizers; skip for display
    if (/^[A-Za-z]+$/.test(piece) && piece.length > 6) {
      // Break long words into chunks of up to 4 characters — a rough stand-in
      // for how rare words get assembled from smaller known pieces.
      for (let i = 0; i < piece.length; i += 4) {
        tokens.push(piece.slice(i, i + 4));
      }
    } else if (/^\d+$/.test(piece) && piece.length > 3) {
      // Long numbers also get chunked.
      for (let i = 0; i < piece.length; i += 3) {
        tokens.push(piece.slice(i, i + 3));
      }
    } else {
      tokens.push(piece);
    }
  }
  return tokens;
}

const CHIP_COLORS = [
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
];

const PRESETS: { label: string; text: string }[] = [
  { label: "Common words", text: "The cat sat on the mat and the dog ran to the park." },
  { label: "A long rare word", text: "antidisestablishmentarianism" },
  { label: "Emoji & code", text: "console.log(\"hello 👋🌍\"); // greet the 🌎" },
];

export default function TokenVisualizer() {
  const [text, setText] = useState(
    "Try typing your name, a sentence, or a really long word!"
  );

  const tokens = useMemo(() => simulateTokens(text), [text]);
  const charCount = text.length;

  return (
    <Card className="my-6">
      <h3 className="text-lg font-semibold">🔤 Token Visualizer</h3>
      <p className="mt-1 text-xs text-zinc-400">
        A simplified simulation — real tokenizers differ, but the idea is the
        same: common words stay whole, rare words break into chunks.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Type anything here..."
        className="mt-4 w-full resize-y rounded-lg border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.label}
            variant="secondary"
            className="!px-3 !py-1.5 text-xs"
            onClick={() => setText(p.text)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <span className="rounded-full bg-indigo-100 px-3 py-1 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          {tokens.length} token{tokens.length === 1 ? "" : "s"}
        </span>
        <span className="text-zinc-500">
          {charCount} character{charCount === 1 ? "" : "s"}
        </span>
        {tokens.length > 0 && (
          <span className="text-xs text-zinc-400">
            (~{(charCount / tokens.length).toFixed(1)} characters per token)
          </span>
        )}
      </div>

      <div className="mt-3 flex min-h-12 flex-wrap gap-1 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950">
        {tokens.length === 0 ? (
          <span className="text-sm text-zinc-400">
            Type something above to see its tokens.
          </span>
        ) : (
          tokens.map((t, i) => (
            <span
              key={i}
              className={`rounded px-1.5 py-0.5 font-mono text-sm ${
                CHIP_COLORS[i % CHIP_COLORS.length]
              }`}
            >
              {t}
            </span>
          ))
        )}
      </div>
    </Card>
  );
}
