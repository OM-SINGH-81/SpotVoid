'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Check for API Key
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not set in environment variables." },
        { status: 500 }
    );
  }

  try {
    // 2. Initialize the Gemini Client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 3. Send a simple, hardcoded prompt to the model
    const prompt = "Hello world";
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // 4. Return the successful response
    return NextResponse.json({ success: true, output: text });

  } catch (error: any) {
    console.error("Simple AI Test Error:", error);
    // 5. Return any errors from the API
    return NextResponse.json(
        { success: false, error: error.message || "An unknown error occurred." },
        { status: 500 }
    );
  }
}