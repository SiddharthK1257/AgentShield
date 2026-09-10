import { NextRequest, NextResponse } from 'next/server';
import { securityEngine } from '@/lib/security/engine';
import { ToolValidationRequest } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body: ToolValidationRequest = await req.json();

    if (!body.toolName) {
      return NextResponse.json({ error: 'Field "toolName" is required' }, { status: 400 });
    }

    const traceId = `TRC-TOOL-${Date.now().toString().slice(-5)}`;
    const result = securityEngine.validateToolCall(body, traceId);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Tool validation failed' }, { status: 500 });
  }
}
