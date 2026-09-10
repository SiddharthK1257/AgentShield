import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function GET() {
  try {
    const metrics = dataStore.getMetrics();
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch metrics' }, { status: 500 });
  }
}
