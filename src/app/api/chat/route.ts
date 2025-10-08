
import { askQuestion } from "@/ai/flows/ai-chat-assistant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = await askQuestion(body);
        return NextResponse.json(result);
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
