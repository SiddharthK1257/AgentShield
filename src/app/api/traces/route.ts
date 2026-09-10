import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function GET() {
  try {
    const traces = dataStore.getTraces();
    return NextResponse.json({
      traces,
      total: traces.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch traces' }, { status: 500 });
  }
}
