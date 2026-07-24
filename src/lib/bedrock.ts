import { AnthropicBedrockMantle } from "@anthropic-ai/bedrock-sdk";

/**
 * Module-level singleton Bedrock client.
 *
 * Uses the Mantle client (Messages-API Bedrock endpoint) — it exposes the
 * standard `messages.create` / `messages.stream` surface. Auth is resolved
 * automatically by the constructor: explicit creds > awsProfile >
 * AWS_BEARER_TOKEN_BEDROCK env var > default AWS credential chain.
 *
 * Region resolves from AWS_REGION / AWS_DEFAULT_REGION; we provide a final
 * fallback so importing this module never throws at build time.
 *
 * Node.js runtime only — routes importing this must set
 * `export const runtime = "nodejs"`.
 */
export const bedrock = new AnthropicBedrockMantle({
  awsRegion:
    process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? "us-east-1",
});

/**
 * Bedrock Mantle model IDs carry an `anthropic.` prefix
 * (e.g. "anthropic.claude-haiku-4-5").
 */
const DEFAULT_MODEL = "anthropic.claude-haiku-4-5";

/** Model used to run learner prompts in the playground. */
export const PLAYGROUND_MODEL: string =
  process.env.PLAYGROUND_MODEL ?? DEFAULT_MODEL;

/** Model used by the LLM judge that scores learner prompts. */
export const JUDGE_MODEL: string = process.env.JUDGE_MODEL ?? DEFAULT_MODEL;
