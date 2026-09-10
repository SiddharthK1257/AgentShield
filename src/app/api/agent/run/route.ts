import { NextRequest, NextResponse } from 'next/server';
import { AgentShieldGateway } from '@/lib/agent/simulator';
import { AgentRunRequest } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: AgentRunRequest = await req.json();

    if (!body.prompt || typeof body.prompt !== 'string' || body.prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Field "prompt" is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    const result = await AgentShieldGateway.execute(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/agent/run Error]:', error);
    return NextResponse.json(
      {
        error: 'Pipeline execution failed',
        details: error?.message || 'Unknown server error',
        decision: 'BLOCK', // Fail safe principle
      },
      { status: 500 }
    );
  }
}
