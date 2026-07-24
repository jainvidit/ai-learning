import { bedrock, JUDGE_MODEL } from "@/lib/bedrock";
import type { PlaygroundExercise } from "@/lib/schema";

/** Result of grading a student's prompt against an exercise rubric. */
export interface JudgeResult {
  score: number;
  passed: boolean;
  criteria: {
    id: string;
    description: string;
    met: boolean;
    feedback: string;
  }[];
  overallFeedback: string;
  improvedPromptExample: string;
}

const MODEL_OUTPUT_MAX_CHARS = 6000;
const MAX_TOKENS = 1500;

const JUDGE_SYSTEM_PROMPT = `You are a strict but encouraging prompt-engineering instructor grading a beginner's prompt against a rubric.

Rules:
- You are judging the STUDENT'S PROMPT, not the model output. The model output is evidence of how well the prompt worked, but the grade is for the prompt itself.
- Be strict: only mark a criterion as met if the prompt clearly satisfies it. Be encouraging in tone: acknowledge what the student did well.
- Quote specific words or phrases from the student's prompt (and, where relevant, the model output) in your feedback so the student can see exactly what you are referring to.
- For every criterion that is NOT met, give one concrete, actionable improvement the student can make to their prompt.
- Provide an improved example prompt that would satisfy all rubric criteria while staying true to the student's intent.

Respond with ONLY a JSON object matching this exact schema — no markdown fences, no commentary before or after:
{
  "criteria": [
    { "id": "<criterion id from the rubric>", "met": true | false, "feedback": "<specific feedback, quoting the prompt; if not met, include one concrete improvement>" }
  ],
  "overallFeedback": "<2-4 sentence overall assessment: what worked, what to focus on next>",
  "improvedPromptExample": "<a complete rewritten prompt that would meet all criteria>"
}
Include exactly one entry in "criteria" for every criterion in the rubric, using its exact id.`;

interface ModelCriterionAnswer {
  id?: unknown;
  met?: unknown;
  feedback?: unknown;
}

interface ModelJudgeAnswer {
  criteria?: ModelCriterionAnswer[];
  overallFeedback?: unknown;
  improvedPromptExample?: unknown;
}

function extractText(content: unknown): string {
  if (!Array.isArray(content)) return "";
  return content
    .filter(
      (block): block is { type: "text"; text: string } =>
        typeof block === "object" &&
        block !== null &&
        (block as { type?: unknown }).type === "text" &&
        typeof (block as { text?: unknown }).text === "string"
    )
    .map((block) => block.text)
    .join("\n");
}

/** Strip markdown code fences (```json ... ```) if the model wrapped its JSON. */
function stripFences(text: string): string {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * One non-streaming judge call that must yield parseable JSON.
 * Retries the API call once if the first response fails to parse.
 */
async function callJudgeForJson(
  system: string,
  userContent: string
): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await bedrock.messages.create({
      model: JUDGE_MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: "user", content: userContent }],
    });
    const text = stripFences(extractText(response.content));
    try {
      return JSON.parse(text);
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(
    `Judge returned unparseable JSON: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}

/**
 * Grade a student's prompt against a playground exercise rubric.
 *
 * The numeric score is computed IN CODE (sum of weights of criteria the model
 * marked met, clamped to 0-100 and rounded); the model only supplies per-
 * criterion met/feedback plus overall feedback and an improved example.
 */
export async function judgePrompt(
  exercise: PlaygroundExercise,
  studentPrompt: string,
  modelOutput: string
): Promise<JudgeResult> {
  const rubricXml = exercise.rubric
    .map(
      (c) =>
        `  <criterion id="${escapeXml(c.id)}" weight="${c.weight}">${escapeXml(
          c.description
        )}</criterion>`
    )
    .join("\n");

  const userContent = [
    `<exercise_instructions>\n${escapeXml(
      exercise.instructions
    )}\n</exercise_instructions>`,
    `<rubric>\n${rubricXml}\n</rubric>`,
    `<student_prompt>\n${escapeXml(studentPrompt)}\n</student_prompt>`,
    `<model_output>\n${escapeXml(
      modelOutput.slice(0, MODEL_OUTPUT_MAX_CHARS)
    )}\n</model_output>`,
  ].join("\n\n");

  const raw = (await callJudgeForJson(
    JUDGE_SYSTEM_PROMPT,
    userContent
  )) as ModelJudgeAnswer;

  // Map the model's answers by id onto the exercise rubric. Any criterion the
  // model failed to assess counts as unmet.
  const answersById = new Map<string, ModelCriterionAnswer>();
  if (Array.isArray(raw?.criteria)) {
    for (const entry of raw.criteria) {
      if (entry && typeof entry.id === "string") {
        answersById.set(entry.id, entry);
      }
    }
  }

  let metWeight = 0;
  const criteria = exercise.rubric.map((criterion) => {
    const answer = answersById.get(criterion.id);
    const met = answer?.met === true;
    if (met) metWeight += criterion.weight;
    return {
      id: criterion.id,
      description: criterion.description,
      met,
      feedback:
        answer && typeof answer.feedback === "string" && answer.feedback
          ? answer.feedback
          : "not assessed",
    };
  });

  const score = Math.round(Math.min(100, Math.max(0, metWeight)));
  const passed = score >= exercise.passingScore;

  return {
    score,
    passed,
    criteria,
    overallFeedback:
      typeof raw?.overallFeedback === "string" ? raw.overallFeedback : "",
    improvedPromptExample:
      typeof raw?.improvedPromptExample === "string"
        ? raw.improvedPromptExample
        : "",
  };
}

const CRITERION_SYSTEM_PROMPT = `You are a strict evaluator. Decide whether the given content satisfies the given criterion.

Respond with ONLY a JSON object matching this exact schema — no markdown fences, no commentary:
{ "met": true | false, "reason": "<one or two sentences explaining the verdict, quoting specifics from the content>" }`;

/**
 * Boolean-verdict helper: does `content` satisfy `criterion`?
 * Reused by the challenge verifier agent.
 */
export async function judgeCriterion(
  content: string,
  criterion: string
): Promise<{ met: boolean; reason: string }> {
  const userContent = [
    `<criterion>\n${escapeXml(criterion)}\n</criterion>`,
    `<content>\n${escapeXml(content)}\n</content>`,
  ].join("\n\n");

  const raw = (await callJudgeForJson(
    CRITERION_SYSTEM_PROMPT,
    userContent
  )) as { met?: unknown; reason?: unknown };

  return {
    met: raw?.met === true,
    reason: typeof raw?.reason === "string" ? raw.reason : "",
  };
}
