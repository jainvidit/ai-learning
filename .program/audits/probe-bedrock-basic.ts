/**
 * Basic Bedrock probe - verify connectivity works
 */

import { AnthropicBedrockMantle } from "@anthropic-ai/bedrock-sdk";

const bedrock = new AnthropicBedrockMantle({
  awsRegion:
    process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? "us-east-1",
});

async function probe() {
  console.log("=== Basic Bedrock Connectivity Probe ===");
  console.log("AWS_REGION:", process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? "us-east-1");

  try {
    const response = await bedrock.messages.create({
      model: "anthropic.claude-haiku-4-5",
      max_tokens: 50,
      messages: [
        {
          role: "user",
          content: "Say hello",
        },
      ],
    });

    console.log("✓ Basic call succeeded");
    console.log("\nResponse:");
    console.log(JSON.stringify(response, null, 2));
  } catch (error: any) {
    console.error("✗ Basic call failed");
    console.error("Error:", error.message);
    console.error("Full error:", JSON.stringify(error, null, 2));
  }
}

probe();
