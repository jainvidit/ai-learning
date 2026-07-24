import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
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
  mdx,
  moduleId,
  lessonId,
  exercises,
}: {
  mdx: string;
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

  return (
    <MDXRemote source={mdx} components={{ ...mdxComponents, Exercise }} />
  );
}
