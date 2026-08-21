/**
 * Probe script for ASSUMPTIONS #12 — Bedrock structured outputs
 *
 * Tests whether output_config.json_schema works against this repo's existing
 * Bedrock setup. This is a minimal live call using the app's existing
 * credentials/config path.
 */

import { AnthropicBedrockMantle } from "@anthropic-ai/bedrock-sdk";

const bedrock = new AnthropicBedrockMantle({
  awsRegion:
    process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? "us-east-1",
});

const schema = {
  type: "object",
  properties: {
    color: {
      type: "string",
      enum: ["red", "blue", "green"],
    },
    reason: {
      type: "string",
    },
  },
  required: ["color", "reason"],
};

async function probe() {
  console.log("=== Bedrock Structured Outputs Probe ===");
  console.log("AWS_REGION:", process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? "us-east-1");
  console.log("Testing output_config.json_schema...\n");

  try {
    const response = await bedrock.messages.create({
      model: "anthropic.claude-haiku-4-5",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Pick a color from red, blue, or green and explain why.",
        },
      ],
      // @ts-expect-error - Testing if output_config is supported
      output_config: {
        json_schema: {
          name: "color_choice",
          schema: schema,
        },
      },
    });

    console.log("✓ SUCCESS - Structured output call succeeded");
    console.log("\nResponse:");
    console.log(JSON.stringify(response, null, 2));

    // Check if we got structured output
    const firstContent = response.content[0];
    if (firstContent.type === "text") {
      try {
        const parsed = JSON.parse(firstContent.text);
        console.log("\n✓ Response is valid JSON");
        console.log("Parsed:", parsed);

        if (parsed.color && parsed.reason) {
          console.log("\n✓ Response conforms to schema (has color and reason)");
        } else {
          console.log("\n✗ Response JSON does not conform to schema");
        }
      } catch (e) {
        console.log("\n✗ Response is not valid JSON:", firstContent.text);
      }
    }
  } catch (error: any) {
    console.error("✗ FAILED - Structured output call failed");
    console.error("\nError details:");
    console.error("Message:", error.message);
    console.error("Status:", error.status);
    console.error("Error object:", JSON.stringify(error, null, 2));
  }
}

probe();
