import { NextResponse } from 'next/server';
import { mossService } from '@/lib/moss/service';
import { checkMongoConnection } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const mossStatus = mossService.getEngineStatus();
    const mongoStatus = await checkMongoConnection();

    return NextResponse.json({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      service: 'AgentShield Trust & Safety Runtime Gateway',
      moss: mossStatus,
      database: {
        type: 'MongoDB Atlas',
        configured: mongoStatus.connected,
        dbName: mongoStatus.dbName,
        latencyMs: mongoStatus.latencyMs,
        collections: mongoStatus.collections,
        error: mongoStatus.error,
      },
      uptimeSeconds: Math.floor(process.uptime()),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'unhealthy', error: error?.message || 'Health check failed' },
      { status: 500 }
    );
  }
}
