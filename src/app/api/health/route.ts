import { NextResponse } from 'next/server';
import { mossService } from '@/lib/moss/service';

export async function GET() {
  try {
    const mossStatus = mossService.getEngineStatus();
    return NextResponse.json({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      service: 'AgentShield Trust & Safety Runtime Gateway',
      moss: mossStatus,
      uptimeSeconds: Math.floor(process.uptime()),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'unhealthy', error: error?.message || 'Health check failed' },
      { status: 500 }
    );
  }
}
