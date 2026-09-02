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

    // Remove the data URI prefix if present (e.g. data:image/jpeg;base64,)
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    // Using claude-3-5-sonnet-20240620 for robust vision support
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
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
                media_type: "image/jpeg",
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
      // Try to parse the response as JSON (sometimes it still wraps in markdown)
      const cleaned = content.text.replace(/```json\n|\n```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Claude JSON response:", content.text);
      throw new Error("Failed to parse extracted medicine details");
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
