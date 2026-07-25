import type {
  ComponentPropsWithoutRef,
  ReactElement,
  ReactNode,
} from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { getCompiledLesson } from "@/lib/content";
import type {
  Exercise as ExerciseData,
  QuizExercise,
} from "@/lib/schema";
import { Callout } from "@/components/ui";
import Quiz, { type ClientQuizExercise } from "@/components/lesson/Quiz";
import Playground from "@/components/lesson/Playground";
import Terminal from "@/components/lesson/Terminal";
import Challenge from "@/components/lesson/Challenge";
import TokenVisualizer from "@/components/lesson/TokenVisualizer";
import NextWordGame from "@/components/lesson/NextWordGame";

/**
 * INTERIM LESSON RENDERER (REQ-CP-01, coupling #27).
 *
 * MDX is no longer compiled here. Velite compiles it at BUILD time (velite.config.ts ->
 * `.velite/lessons.json`); this component only EVALUATES already-compiled output, so
 * there is no MDX compilation anywhere in the request path and `next-mdx-remote` is gone
 * from the dependency tree.
 *
 * This file is INTERIM BY CHARTER: ROOT.4.2 replaces it with BeatRenderer in Phase 3.
 * Two things must survive that replacement verbatim and are deliberately left
 * byte-identical below so they can be lifted out as-is:
 *
 *   1. `mdxComponents` — the element/component map: h2, h3, p, ul, ol, li, code, pre,
 *      blockquote, a, strong, table (wrapped in an overflow div), plus the component
 *      entries Callout, TokenVisualizer, NextWordGame, plus the locally-closed
 *      `Exercise` injected per render. Every className is unchanged from the
 *      pre-Velite version, so the rendered DOM and every CSS selector are identical
 *      (regression floor RF-02/RF-11 anchor on this file).
 *   2. `sanitizeQuiz` — projects a QuizExercise down to ClientQuizExercise, dropping
 *      `correctOptionIds` and `explanation` per question and every option field except
 *      `id`/`text`, so answers never reach the client bundle or payload. Untouched.
 */

/**
 * Evaluate a Velite-compiled MDX function body into a React element tree.
 *
 * Velite's default `outputFormat` is `'function-body'`: `code` is the BODY of a function
 * that reads its JSX runtime from `arguments[0]` and returns `{ default }`. It must
 * therefore be constructed with `new Function` (a non-arrow function, so `arguments`
 * exists) and invoked with the runtime object. This is EVALUATION of a build-time
 * artifact — no MDX parser, no compiler, and no `@mdx-js` code runs at request time.
 *
 * The compiled `default` export is INVOKED DIRECTLY rather than mounted as
 * `<MdxContent/>`. Mounting would declare a fresh component identity on every render,
 * which `react-hooks/static-components` correctly rejects: a new identity remounts the
 * subtree and would reset the internal state of the interactive widgets the components
 * map injects (TokenVisualizer, NextWordGame, Quiz). Calling it returns the element tree
 * without introducing a new component identity.
 */
function renderCompiledMdx(
  code: string,
  components: Record<string, unknown>
): ReactElement {
  const factory = new Function(code) as (runtime: {
    Fragment: unknown;
    jsx: unknown;
    jsxs: unknown;
  }) => {
    default: (props: { components?: Record<string, unknown> }) => ReactElement;
  };
  return factory({ Fragment, jsx, jsxs }).default({ components });
}

/** Strip answers/explanations so they never reach the client bundle/payload. */
function sanitizeQuiz(exercise: QuizExercise): ClientQuizExercise {
  return {
    type: "quiz",
    id: exercise.id,
    title: exercise.title,
    passingScore: exercise.passingScore,
    questions: exercise.questions.map((q) => ({
      id: q.id,
      kind: q.kind,
      prompt: q.prompt,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
    })),
  };
}

const mdxComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-10 border-b border-zinc-200 pb-2 text-2xl font-bold dark:border-zinc-800"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-8 text-xl font-semibold" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p
      className="my-4 leading-7 text-zinc-700 dark:text-zinc-300"
      {...props}
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="my-4 list-disc space-y-2 pl-6 text-zinc-700 dark:text-zinc-300"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="my-4 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-7" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] text-indigo-700 dark:bg-zinc-800 dark:text-indigo-300"
      {...props}
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="my-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm text-zinc-100 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit"
      {...props}
    />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-4 border-l-4 border-indigo-300 pl-4 italic text-zinc-600 dark:border-indigo-700 dark:text-zinc-400"
      {...props}
    />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
      {...props}
    />
  ),
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong
      className="font-semibold text-zinc-900 dark:text-zinc-100"
      {...props}
    />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-4 overflow-x-auto">
      <table
        className="w-full border-collapse text-sm [&_td]:border [&_td]:border-zinc-200 [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-zinc-200 [&_th]:bg-zinc-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold dark:[&_td]:border-zinc-800 dark:[&_th]:border-zinc-800 dark:[&_th]:bg-zinc-900"
        {...props}
      />
    </div>
  ),
  Callout,
  TokenVisualizer,
  NextWordGame,
};

export default function LessonRenderer({
  code,
  moduleId,
  lessonId,
  exercises,
}: {
  /**
   * Build-time-compiled MDX (a Velite `s.mdx()` function body). OPTIONAL: when omitted,
   * the renderer resolves it from the compiled bundle by `moduleId`/`lessonId`, so the
   * pre-Velite call site — which passes only `mdx`/`moduleId`/`lessonId`/`exercises` —
   * keeps working unchanged. `src/app/learn/**` belongs to ROOT.4.2, not to this item, so
   * this prop change is strictly additive.
   */
  code?: string;
  /**
   * @deprecated Raw MDX source is no longer rendered — compilation moved to build time
   * (REQ-CP-01). Accepted and ignored so the existing call site still type-checks.
   */
  mdx?: string;
  moduleId: string;
  lessonId: string;
  exercises: ExerciseData[];
}) {
  function Exercise({ id }: { id: string }): ReactNode {
    const exercise = exercises.find((e) => e.id === id);
    if (!exercise) {
      return (
        <Callout kind="warning">
          Exercise <code>{id}</code> not found in this lesson.
        </Callout>
      );
    }
    switch (exercise.type) {
      case "quiz":
        return (
          <Quiz
            moduleId={moduleId}
            lessonId={lessonId}
            exercise={sanitizeQuiz(exercise)}
          />
        );
      case "playground":
        return (
          <Playground
            moduleId={moduleId}
            lessonId={lessonId}
            exercise={exercise}
          />
        );
      case "terminal":
        return (
          <Terminal
            moduleId={moduleId}
            lessonId={lessonId}
            exercise={exercise}
          />
        );
      case "challenge":
        return (
          <Challenge
            moduleId={moduleId}
            lessonId={lessonId}
            exercise={exercise}
          />
        );
    }
  }

  const compiledCode = code ?? getCompiledLesson(moduleId, lessonId)?.code;
  if (compiledCode === undefined) {
    return (
      <Callout kind="warning">
        Lesson <code>{`${moduleId}/${lessonId}`}</code> has no build-time-compiled
        content. Run <code>npm run content:build</code> and reload.
      </Callout>
    );
  }

  return renderCompiledMdx(compiledCode, { ...mdxComponents, Exercise });
}
