import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAppUserId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAppUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "Anthropic API key is not configured on the server." }, { status: 500 });
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Extract media type from data URI (default to image/jpeg)
    let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/jpeg";
    const match = imageBase64.match(/^data:(image\/(jpeg|png|gif|webp));base64,/i);
    if (match) {
      mediaType = match[1].toLowerCase() as any;
    }

    // Remove the data URI prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, "");

    // Using active Claude 4.5 vision model (claude-haiku-4-5-20251001)
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: "You are a specialized medical assistant. Your job is to extract the medicine name and dosage from an image of a medicine package. You must return ONLY a JSON object with two keys: 'name' and 'dose'. If you cannot find one of the details, leave the string empty. Do not include any markdown formatting, backticks, or other text outside the JSON object.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: "Extract the medicine name and dose from this package.",
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error("Unexpected response type from Claude");
    }

    let parsed = { name: "", dose: "" };
    try {
      // Find JSON block even if model includes commentary or markdown
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (e) {
      console.error("Failed to parse Claude JSON response:", content.text);
      throw new Error("Could not extract medicine details. Please enter manually.");
    }

    return NextResponse.json({ success: true, data: parsed });

  } catch (error: any) {
    console.error("Error scanning medicine:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scan medicine" },
      { status: 500 }
    );
  }
}
