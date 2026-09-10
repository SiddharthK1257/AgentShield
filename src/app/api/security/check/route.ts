import { NextRequest, NextResponse } from 'next/server';
import { securityEngine } from '@/lib/security/engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, type = 'input', traceId = 'TRC-CHK-01' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Field "text" is required' }, { status: 400 });
    }

    let result;
    if (type === 'output') {
      result = securityEngine.evaluateOutput(text, traceId);
    } else {
      result = securityEngine.evaluateInput(text, traceId);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Security check failed' }, { status: 500 });
  }
}
