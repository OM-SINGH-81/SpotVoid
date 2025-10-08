
import { predictCrime } from "@/ai/flows/ai-crime-prediction";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = await predictCrime(body);
        return NextResponse.json(result);
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
