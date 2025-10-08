
import { generateWomensSafetyAlerts } from "@/ai/flows/ai-womens-safety-alerts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const result = await generateWomensSafetyAlerts();
        return NextResponse.json(result);
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
