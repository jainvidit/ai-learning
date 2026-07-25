# Probe: Bedrock Structured Outputs (ASSUMPTIONS #12)

**Item:** ROOT.1.9  
**Date:** 2026-07-25  
**Verdict:** BLOCKED — `output_config.json_schema` parameter is NOT supported by the current Bedrock Mantle SDK

## Objective

Exercise ASSUMPTIONS #12: verify whether `output_config.json_schema` (structured outputs) works against this repo's existing Bedrock setup with a live call.

## Environment

- **SDK:** `@anthropic-ai/bedrock-sdk` v0.32.0
- **Model:** `anthropic.claude-haiku-4-5`
- **Region:** us-east-1
- **Auth:** AWS_BEARER_TOKEN_BEDROCK (inherited from environment)

## Test Methodology

1. Basic connectivity probe: verify Bedrock Mantle client works with existing credentials
2. Structured outputs probe: attempt to use `output_config.json_schema` parameter
3. Fallback attempts with alternative parameter structures

## Results

### Basic Connectivity: ✓ SUCCESS

The existing Bedrock setup works correctly. Basic message call succeeded:

```
Request:
{
  model: "anthropic.claude-haiku-4-5",
  max_tokens: 50,
  messages: [{ role: "user", content: "Say hello" }]
}

Response:
{
  "model": "claude-haiku-4-5-20251001",
  "id": "msg_bdrk_fozgh3v2o723cmkkdzmdpbxour7ao5kv4zsbkowldniw7ggf74gq",
  "type": "message",
  "role": "assistant",
  "content": [{"type": "text", "text": "Hello! 👋 How can I help you today?"}],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 9,
    "output_tokens": 16,
    "service_tier": "standard"
  }
}
```

### Structured Outputs: ✗ FAILED

**Attempt 1: Using `output_config.format: "json_schema"`**

```typescript
output_config: {
  format: "json_schema",
  json_schema: {
    name: "color_choice",
    schema: { /* JSON schema */ }
  }
}
```

**Error:**
```
Status: 400
Type: invalid_request_error
Message: "invalid type: string \"json_schema\", expected struct JsonOutputFormat at line 1 column 190"
Request ID: req_2onu3ee4vaw4mdx5r2cca5m3t2dnqecfdfujkkw4sb3hj4r4x6cq
```

**Attempt 2: Using `output_config.json_schema` directly (without format field)**

```typescript
output_config: {
  json_schema: {
    name: "color_choice",
    schema: { /* JSON schema */ }
  }
}
```

**Error:**
```
Status: 400
Type: invalid_request_error
Message: "output_config.json_schema: Extra inputs are not permitted"
Request ID: req_4tyi2ypm4rbg6aeeyupiwnylw5nen4buae3duc3e3o3h42e6hvka
```

## Analysis

1. **Basic Bedrock connectivity is working** — the app's existing credentials/config path is functional for standard message calls.

2. **The `output_config` parameter is not supported** by the Bedrock Mantle SDK (v0.32.0). Both attempts to use structured outputs were rejected with 400 errors.

3. **The error messages indicate:**
   - First attempt: The API expects a struct type for `format`, not a string literal
   - Second attempt: The `json_schema` field is not permitted in `output_config` at all

4. **Possible explanations:**
   - The Bedrock Messages API endpoint may not yet support structured outputs (Bedrock often lags behind the direct Anthropic API in feature support)
   - The `@anthropic-ai/bedrock-sdk` package (v0.32.0) may not expose the parameter even if the API supports it
   - The parameter structure may be different for Bedrock than for the direct Anthropic API

## Implications for ROOT.2.3 (Judge Pipeline - Structured Outputs)

REQ-JP-01 states: "judge output uses strict structured outputs via `output_config.format json_schema` (replacing prose-JSON + fence-stripping)."

**This requirement cannot be implemented as specified against the current Bedrock setup.**

ROOT.2.3 will need an ADR before dispatch to decide between:

1. **Migrate to direct Anthropic API** — use the standard Anthropic SDK which supports structured outputs
2. **Wait for Bedrock Mantle SDK update** — defer until `output_config` is supported
3. **Use tool-use as structured output mechanism** — REJECTED.md notes this was rejected, but may need reconsideration
4. **Keep prose-JSON parsing** — retain the current approach (contradicts the blueprint's structured-outputs decision)

## Probe Artifacts

- Basic connectivity probe: `.program/audits/probe-bedrock-basic.ts`
- Structured outputs probe: `.program/audits/probe-bedrock-structured-outputs.ts`

## Recommendation

An ADR is required before dispatching ROOT.2.3. The decision should consider:
- Whether to migrate to direct Anthropic API (REQ-MG-01 already specifies "direct Anthropic API / Vertex are config swaps")
- SDK version compatibility and update frequency
- Blueprint's anti-fence-stripping rationale vs implementation constraints
