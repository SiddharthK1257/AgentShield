import { NextRequest, NextResponse } from 'next/server';
import { mossService } from '@/lib/moss/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chunks } = body;

    if (!Array.isArray(chunks)) {
      return NextResponse.json({ error: 'Field "chunks" must be an array of ContextChunk objects.' }, { status: 400 });
    }

    const evaluation = await mossService.validateContext(chunks);
    return NextResponse.json(evaluation);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Context validation failed' }, { status: 500 });
  }
}
