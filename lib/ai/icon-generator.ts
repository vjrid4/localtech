import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

const claude = new Anthropic();
const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

const imageGenerateTool: Anthropic.Tool = {
  name: "generate_image",
  description:
    "Generate a realistic icon image from a text prompt. Call this when you have a refined, detailed prompt ready.",
  input_schema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description:
          "Detailed image generation prompt. Be specific about style, colors, and composition for a clean app icon.",
      },
    },
    required: ["prompt"],
  },
};

async function generateWithImagen(prompt: string): Promise<string> {
  const response = await genai.models.generateImages({
    model: "imagen-3.0-fast-generate-001",
    prompt,
    config: { numberOfImages: 1 },
  });

  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
  if (!imageBytes) throw new Error("No image returned from Imagen");

  return `data:image/png;base64,${imageBytes}`;
}

export async function generateIcon(description: string): Promise<{
  dataUrl: string;
  prompt: string;
}> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Create a professional app icon for: "${description}".

Design guidelines:
- Clean, modern flat icon style
- Bold, simple shapes — recognizable at small sizes
- No text, no gradients
- White or transparent background
- Suitable for a repair marketplace app (LocalTech)

Craft a detailed image generation prompt and call generate_image.`,
    },
  ];

  let finalPrompt = "";
  let finalDataUrl = "";

  while (true) {
    const response = await claude.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools: [imageGenerateTool],
      messages,
    });

    if (response.stop_reason === "end_turn") break;

    if (response.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === "tool_use" && block.name === "generate_image") {
          const input = block.input as { prompt: string };
          finalPrompt = input.prompt;

          try {
            finalDataUrl = await generateWithImagen(input.prompt);
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify({ success: true }),
            });
          } catch (err) {
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              is_error: true,
              content: `Image generation failed: ${err}`,
            });
          }
        }
      }

      messages.push({ role: "user", content: toolResults });
    } else {
      break;
    }
  }

  if (!finalDataUrl) throw new Error("No image was generated");
  return { dataUrl: finalDataUrl, prompt: finalPrompt };
}
