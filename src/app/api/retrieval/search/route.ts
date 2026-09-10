import { NextRequest, NextResponse } from 'next/server';
import { mossService } from '@/lib/moss/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, topK = 4, injectedContext, includeConflicting } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Field "query" is required' }, { status: 400 });
    }

    const result = await mossService.retrieveContext(query, {
      topK,
      injectedContext,
      includeConflicting,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Retrieval search failed' }, { status: 500 });
  }
}
