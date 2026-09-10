import { NextResponse } from 'next/server';
import { checkMongoConnection } from '@/lib/db/mongodb';
import { dataStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await checkMongoConnection();
    return NextResponse.json({
      ...status,
      timestamp: new Date().toISOString(),
      mode: 'hybrid_zero_latency',
      description: 'Zero-latency In-Memory Cache + Asynchronous MongoDB Atlas Write-Through Persistence',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        connected: false,
        error: error?.message || 'Failed to check MongoDB connection',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const syncResult = await dataStore.initMongo();
    const status = await checkMongoConnection();
    return NextResponse.json({
      success: true,
      sync: syncResult,
      dbStatus: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to sync with MongoDB Atlas',
      },
      { status: 500 }
    );
  }
}
