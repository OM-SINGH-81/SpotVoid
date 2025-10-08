
import { generatePatrolRoute } from "@/ai/flows/ai-patrol-routes";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // The generatePatrolRoute flow expects an object with 'predictedData' and 'policeStation'
        const result = await generatePatrolRoute({ 
            predictedData: body.predictedData,
            policeStation: body.policeStation 
        });
        return NextResponse.json(result);
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
