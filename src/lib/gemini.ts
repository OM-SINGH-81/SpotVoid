import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("⚠️ GEMINI_API_KEY not set in .env.local");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
