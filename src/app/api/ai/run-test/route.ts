import { simpleTestFlow } from '@/ai/flows/ai-simple-test-flow';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const result = await simpleTestFlow(null);
    return NextResponse.json({ success: true, models: result });
  } catch (error: any) {
    console.error('Simple Test API Error:', error);
    // It's helpful to send the full error message back in a test scenario
    return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
    );
  }
}
