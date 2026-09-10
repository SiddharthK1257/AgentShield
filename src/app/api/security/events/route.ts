import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const severity = searchParams.get('severity') || undefined;

    const events = dataStore.getSecurityEvents(severity);
    return NextResponse.json({
      events,
      total: events.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch security events' }, { status: 500 });
  }
}
