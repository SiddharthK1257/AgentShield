import { MongoClient, Db, Collection } from 'mongodb';
import { TraceRecord, SecurityEvent, EvaluationRecord, GuardrailPolicy } from '../types';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getMongoUri(): string {
  return process.env.MONGODB_URI || '';
}

export function getMongoDbName(): string {
  return process.env.MONGODB_DB || 'agentshield';
}

export function isMongoConfigured(): boolean {
  const uri = getMongoUri();
  return !!uri && uri.startsWith('mongodb');
}

export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = getMongoUri();
  if (!uri || !uri.startsWith('mongodb')) {
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      clientPromise = client.connect();
    }
    return clientPromise;
  }
}

export async function getDatabase(): Promise<Db | null> {
  try {
    const mongoClient = await getMongoClient();
    if (!mongoClient) return null;
    return mongoClient.db(getMongoDbName());
  } catch (error) {
    console.warn('[MongoDB] Unable to connect to database:', error);
    return null;
  }
}

export async function getTracesCollection(): Promise<Collection<TraceRecord> | null> {
  const db = await getDatabase();
  return db ? db.collection<TraceRecord>('traces') : null;
}

export async function getSecurityEventsCollection(): Promise<Collection<SecurityEvent> | null> {
  const db = await getDatabase();
  return db ? db.collection<SecurityEvent>('security_events') : null;
}

export async function getEvaluationsCollection(): Promise<Collection<EvaluationRecord> | null> {
  const db = await getDatabase();
  return db ? db.collection<EvaluationRecord>('evaluations') : null;
}

export async function getPoliciesCollection(): Promise<Collection<GuardrailPolicy> | null> {
  const db = await getDatabase();
  return db ? db.collection<GuardrailPolicy>('policies') : null;
}

export interface MongoHealthCheckResult {
  connected: boolean;
  dbName: string;
  latencyMs: number;
  error?: string;
  collections?: {
    traces: number;
    securityEvents: number;
    evaluations: number;
    policies: number;
  };
}

export async function checkMongoConnection(): Promise<MongoHealthCheckResult> {
  const dbName = getMongoDbName();
  if (!isMongoConfigured()) {
    return { connected: false, dbName, latencyMs: 0, error: 'MONGODB_URI not configured in environment' };
  }

  const startTime = Date.now();
  try {
    const db = await getDatabase();
    if (!db) {
      return { connected: false, dbName, latencyMs: Date.now() - startTime, error: 'Database client instance is null' };
    }

    await db.command({ ping: 1 });
    const latencyMs = Date.now() - startTime;

    // Fetch collection counts
    let tracesCount = 0;
    let securityEventsCount = 0;
    let evaluationsCount = 0;
    let policiesCount = 0;

    try {
      [tracesCount, securityEventsCount, evaluationsCount, policiesCount] = await Promise.all([
        db.collection('traces').countDocuments(),
        db.collection('security_events').countDocuments(),
        db.collection('evaluations').countDocuments(),
        db.collection('policies').countDocuments(),
      ]);
    } catch {
      // Non-critical if counts fail
    }

    return {
      connected: true,
      dbName,
      latencyMs,
      collections: {
        traces: tracesCount,
        securityEvents: securityEventsCount,
        evaluations: evaluationsCount,
        policies: policiesCount,
      },
    };
  } catch (err: any) {
    return {
      connected: false,
      dbName,
      latencyMs: Date.now() - startTime,
      error: err?.message || 'Connection ping failed',
    };
  }
}

// --- Persistence Helpers for Dual-Mode Store ---

export async function persistTrace(trace: TraceRecord): Promise<boolean> {
  try {
    const col = await getTracesCollection();
    if (!col) return false;
    await col.replaceOne({ id: trace.id } as any, trace, { upsert: true });
    return true;
  } catch (err) {
    console.warn('[MongoDB] Failed to persist trace:', err);
    return false;
  }
}

export async function persistSecurityEvent(event: SecurityEvent): Promise<boolean> {
  try {
    const col = await getSecurityEventsCollection();
    if (!col) return false;
    await col.replaceOne({ id: event.id } as any, event, { upsert: true });
    return true;
  } catch (err) {
    console.warn('[MongoDB] Failed to persist security event:', err);
    return false;
  }
}

export async function persistEvaluation(evalRecord: EvaluationRecord): Promise<boolean> {
  try {
    const col = await getEvaluationsCollection();
    if (!col) return false;
    await col.replaceOne({ id: evalRecord.id } as any, evalRecord, { upsert: true });
    return true;
  } catch (err) {
    console.warn('[MongoDB] Failed to persist evaluation:', err);
    return false;
  }
}

export async function persistPolicy(policy: GuardrailPolicy): Promise<boolean> {
  try {
    const col = await getPoliciesCollection();
    if (!col) return false;
    await col.replaceOne({ id: policy.id } as any, policy, { upsert: true });
    return true;
  } catch (err) {
    console.warn('[MongoDB] Failed to persist policy:', err);
    return false;
  }
}

export async function loadInitialCollections(): Promise<{
  traces: TraceRecord[];
  securityEvents: SecurityEvent[];
  evaluations: EvaluationRecord[];
  policies: GuardrailPolicy[];
} | null> {
  try {
    const db = await getDatabase();
    if (!db) return null;

    const [traces, securityEvents, evaluations, policies] = await Promise.all([
      db.collection<TraceRecord>('traces').find({}).sort({ timestamp: -1 }).limit(100).toArray(),
      db.collection<SecurityEvent>('security_events').find({}).sort({ timestamp: -1 }).limit(100).toArray(),
      db.collection<EvaluationRecord>('evaluations').find({}).sort({ timestamp: -1 }).limit(100).toArray(),
      db.collection<GuardrailPolicy>('policies').find({}).toArray(),
    ]);

    // Clean up MongoDB _id properties
    const clean = (arr: any[]) => arr.map(({ _id, ...rest }) => rest);

    return {
      traces: clean(traces),
      securityEvents: clean(securityEvents),
      evaluations: clean(evaluations),
      policies: clean(policies),
    };
  } catch (err) {
    console.warn('[MongoDB] Failed to load collections:', err);
    return null;
  }
}

export async function seedMongoIfEmpty(initial: {
  traces: TraceRecord[];
  securityEvents: SecurityEvent[];
  evaluations: EvaluationRecord[];
  policies: GuardrailPolicy[];
}): Promise<{ seeded: boolean; counts: Record<string, number> }> {
  try {
    const db = await getDatabase();
    if (!db) return { seeded: false, counts: {} };

    const tracesCount = await db.collection('traces').countDocuments();
    let seeded = false;

    if (tracesCount === 0 && initial.traces.length > 0) {
      await db.collection('traces').insertMany(initial.traces as any[]);
      seeded = true;
    }

    const secCount = await db.collection('security_events').countDocuments();
    if (secCount === 0 && initial.securityEvents.length > 0) {
      await db.collection('security_events').insertMany(initial.securityEvents as any[]);
      seeded = true;
    }

    const evalCount = await db.collection('evaluations').countDocuments();
    if (evalCount === 0 && initial.evaluations.length > 0) {
      await db.collection('evaluations').insertMany(initial.evaluations as any[]);
      seeded = true;
    }

    const polCount = await db.collection('policies').countDocuments();
    if (polCount === 0 && initial.policies.length > 0) {
      await db.collection('policies').insertMany(initial.policies as any[]);
      seeded = true;
    }

    const counts = {
      traces: await db.collection('traces').countDocuments(),
      securityEvents: await db.collection('security_events').countDocuments(),
      evaluations: await db.collection('evaluations').countDocuments(),
      policies: await db.collection('policies').countDocuments(),
    };

    return { seeded, counts };
  } catch (err) {
    console.warn('[MongoDB] Seeding error:', err);
    return { seeded: false, counts: {} };
  }
}
