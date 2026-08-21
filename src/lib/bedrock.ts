import { EventEmitter } from "node:events";

/**
 * Offline model gateway.
 *
 * This app was built assuming Amazon Bedrock access; that access is gone and
 * no replacement backend (e.g. a direct ANTHROPIC_API_KEY) is configured. Both
 * consumers (`judge.ts`, the playground run route) only depend on the
 * `messages.create` / `messages.stream` shapes below, so this fake stands in
 * for `bedrock.ts`'s old `AnthropicBedrockMantle` client without touching
 * call sites.
 *
 * To go live again: `npm install @anthropic-ai/sdk`, set ANTHROPIC_API_KEY in
 * .env.local, and replace the `bedrock` export below with
 * `new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })`.
 */

const OFFLINE_NOTICE =
  "[Offline mode] No model is connected right now — Amazon Bedrock access was removed and no replacement backend is configured. This is a placeholder response, not real model output.";

function estimateTokens(text: string): number {
  return Math.max(1, Math.round(text.length / 4));
}

interface StreamParams {
  model: string;
  max_tokens: number;
  system?: string;
  messages: { role: string; content: string }[];
}

interface StreamOpts {
  signal?: AbortSignal;
}

class FakeMessageStream extends EventEmitter {
  private readonly finalTextPromise: Promise<string>;

  constructor(userPrompt: string, signal?: AbortSignal) {
    super();
    const fullText = `${OFFLINE_NOTICE}\n\nYou entered:\n"${userPrompt.slice(
      0,
      300
    )}"`;
    this.finalTextPromise = this.playback(fullText, signal);
  }

  private async playback(
    fullText: string,
    signal?: AbortSignal
  ): Promise<string> {
    const words = fullText.split(" ");
    for (const word of words) {
      if (signal?.aborted) break;
      await new Promise((resolve) => setTimeout(resolve, 15));
      this.emit("text", word + " ");
    }
    return fullText;
  }

  async finalMessage() {
    const text = await this.finalTextPromise;
    return {
      content: [{ type: "text" as const, text }],
      usage: {
        input_tokens: 0,
        output_tokens: estimateTokens(text),
      },
    };
  }
}

/** JSON payload satisfying both judge.ts callers (judgePrompt's rubric shape and judgeCriterion's boolean shape). */
function offlineJudgeJson(): string {
  return JSON.stringify({
    criteria: [],
    overallFeedback: OFFLINE_NOTICE,
    improvedPromptExample: "",
    met: false,
    reason: OFFLINE_NOTICE,
  });
}

export const bedrock = {
  messages: {
    stream(params: StreamParams, opts?: StreamOpts): FakeMessageStream {
      const lastUserMessage = params.messages.at(-1)?.content ?? "";
      return new FakeMessageStream(String(lastUserMessage), opts?.signal);
    },
    async create(_params: unknown) {
      const text = offlineJudgeJson();
      return {
        content: [{ type: "text" as const, text }],
        usage: { input_tokens: 0, output_tokens: estimateTokens(text) },
      };
    },
  },
};

/** Model used to run learner prompts in the playground. */
export const PLAYGROUND_MODEL = "offline-fake";

/** Model used by the LLM judge that scores learner prompts. */
export const JUDGE_MODEL = "offline-fake";
