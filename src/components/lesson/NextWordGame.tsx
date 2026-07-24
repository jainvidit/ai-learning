"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";

interface Candidate {
  word: string;
  /** Simulated model probability, in percent. Each round's candidates sum to ~100. */
  probability: number;
}

interface Round {
  stem: string;
  candidates: Candidate[];
  /** Extra teaching note shown after the reveal. */
  note?: string;
}

const ROUNDS: Round[] = [
  {
    stem: "The cat sat on the ___",
    candidates: [
      { word: "mat", probability: 62 },
      { word: "sofa", probability: 21 },
      { word: "roof", probability: 12 },
      { word: "keyboard", probability: 5 },
    ],
  },
  {
    stem: "I'll have a coffee with milk and ___",
    candidates: [
      { word: "sugar", probability: 74 },
      { word: "honey", probability: 14 },
      { word: "cinnamon", probability: 9 },
      { word: "ketchup", probability: 3 },
    ],
  },
  {
    stem: "The bank was ___",
    candidates: [
      { word: "closed", probability: 34 },
      { word: "robbed", probability: 26 },
      { word: "crowded", probability: 22 },
      { word: "muddy", probability: 18 },
    ],
    note:
      "Tricky one! “Bank” could be a place for money or the side of a river, so several continuations are all plausible — even “muddy.” When no single word dominates, the model spreads its bets. There isn't always one right answer, only more and less likely ones.",
  },
  {
    stem: "She opened the door and saw a ___",
    candidates: [
      { word: "man", probability: 38 },
      { word: "package", probability: 27 },
      { word: "dog", probability: 20 },
      { word: "dragon", probability: 15 },
    ],
    note:
      "Another open-ended one — stories can go many directions, so the probabilities are spread out. Notice “dragon” still gets a slice: in a fantasy story, it's a perfectly likely continuation.",
  },
  {
    stem: "Thank you so much, I really ___",
    candidates: [
      { word: "appreciate", probability: 68 },
      { word: "owe", probability: 17 },
      { word: "enjoyed", probability: 10 },
      { word: "regret", probability: 5 },
    ],
  },
  {
    stem: "To make an omelette, first crack the ___",
    candidates: [
      { word: "eggs", probability: 88 },
      { word: "shell", probability: 7 },
      { word: "window", probability: 3 },
      { word: "code", probability: 2 },
    ],
  },
  {
    stem: "The weather forecast says it will ___",
    candidates: [
      { word: "rain", probability: 51 },
      { word: "snow", probability: 24 },
      { word: "clear", probability: 16 },
      { word: "sing", probability: 9 },
    ],
  },
  {
    stem: "Once upon a ___",
    candidates: [
      { word: "time", probability: 93 },
      { word: "night", probability: 4 },
      { word: "hill", probability: 2 },
      { word: "sandwich", probability: 1 },
    ],
  },
];

export default function NextWordGame() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = ROUNDS[roundIndex];
  const favorite = round.candidates.reduce((best, c) =>
    c.probability > best.probability ? c : best
  );
  const matchedFavorite = picked !== null && picked === favorite.word;
  const maxProb = favorite.probability;

  function pick(word: string) {
    if (picked !== null) return;
    setPicked(word);
    setRoundsPlayed((n) => n + 1);
    if (word === favorite.word) setScore((s) => s + 1);
  }

  function next() {
    if (roundIndex + 1 >= ROUNDS.length) {
      setFinished(true);
    } else {
      setRoundIndex((i) => i + 1);
      setPicked(null);
    }
  }

  function restart() {
    setRoundIndex(0);
    setPicked(null);
    setScore(0);
    setRoundsPlayed(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <Card className="my-6">
        <h3 className="text-lg font-semibold">🎯 Guess the Next Word</h3>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          You matched the model&apos;s favorite word in{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {score} of {roundsPlayed}
          </span>{" "}
          rounds. Nice prediction instincts! Remember what you saw: sometimes
          one word dominated, and sometimes several words were all plausible.
          An LLM does exactly this — it weighs every possible continuation and
          assigns each a probability.
        </p>
        <div className="mt-4">
          <Button variant="secondary" onClick={restart}>
            Play again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="my-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">🎯 Guess the Next Word</h3>
        <span className="shrink-0 text-xs text-zinc-500">
          Round {roundIndex + 1} of {ROUNDS.length} · Score: {score}/
          {roundsPlayed}
        </span>
      </div>

      <p className="mt-2 text-xs text-zinc-400">
        Pick the word you think the model would rate as most likely.
        (Probabilities are simulated for teaching.)
      </p>

      <p className="mt-4 rounded-lg bg-zinc-100 px-4 py-3 text-base font-medium dark:bg-zinc-800">
        {round.stem.replace("___", "")}
        <span className="rounded bg-indigo-100 px-2 py-0.5 text-indigo-500 dark:bg-indigo-950 dark:text-indigo-400">
          ___
        </span>
      </p>

      {picked === null ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {round.candidates.map((c) => (
            <button
              key={c.word}
              onClick={() => pick(c.word)}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-zinc-800 dark:hover:border-indigo-600 dark:hover:bg-indigo-950"
            >
              {c.word}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {[...round.candidates]
            .sort((a, b) => b.probability - a.probability)
            .map((c) => {
              const isPicked = c.word === picked;
              const isFavorite = c.word === favorite.word;
              return (
                <div key={c.word} className="flex items-center gap-2 text-sm">
                  <span
                    className={`w-24 shrink-0 truncate font-medium ${
                      isPicked
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    {c.word}
                    {isPicked && " ←"}
                  </span>
                  <div className="h-4 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFavorite
                          ? "bg-indigo-600"
                          : "bg-zinc-400 dark:bg-zinc-600"
                      }`}
                      style={{ width: `${(c.probability / maxProb) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs tabular-nums text-zinc-500">
                    {c.probability}%
                  </span>
                </div>
              );
            })}

          <div
            className={`mt-3 rounded-lg p-3 text-sm ${
              matchedFavorite
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
            }`}
          >
            {matchedFavorite ? (
              <>
                <span className="font-semibold">✓ You matched the model!</span>{" "}
                &ldquo;{favorite.word}&rdquo; was the most likely continuation.
              </>
            ) : (
              <>
                <span className="font-semibold">Interesting pick!</span> The
                model&apos;s favorite was &ldquo;{favorite.word}&rdquo; at{" "}
                {favorite.probability}% — but your choice was still on the
                probability list. Less likely doesn&apos;t mean wrong.
              </>
            )}
            {round.note && <p className="mt-2">{round.note}</p>}
          </div>

          <div className="mt-3">
            <Button onClick={next}>
              {roundIndex + 1 >= ROUNDS.length ? "See results" : "Next round"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
