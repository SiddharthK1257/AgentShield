import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function GET() {
  try {
    const evaluations = dataStore.getEvaluations();
    return NextResponse.json({
      evaluations,
      total: evaluations.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch evaluations' }, { status: 500 });
  }
}
