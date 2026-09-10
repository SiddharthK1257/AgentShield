import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const evaluation = dataStore.getEvaluationById(params.id);
    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluation run not found' }, { status: 404 });
    }
    return NextResponse.json(evaluation);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch evaluation' }, { status: 500 });
  }
}
