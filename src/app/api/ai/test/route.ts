import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.query || "Test prompt: Tell me a short story.";

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ success: true, output: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
