import { LatencySpan, PipelineDecision, ThreatType, TraceRecord } from '../types';

export class Tracer {
  private spans: LatencySpan[] = [];
  private traceId: string;
  private startTime: number;
  private query: string;

  constructor(query: string, traceIdPrefix = 'TRC') {
    this.query = query;
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.traceId = `${traceIdPrefix}-${randomSuffix}`;
    this.startTime = Date.now();
  }

  public getTraceId(): string {
    return this.traceId;
  }

  /**
   * Execute an asynchronous task and record high-resolution latency span
   */
  public async traceSpan<T>(
    name: string,
    fn: () => Promise<T>,
    details?: string
  ): Promise<{ result: T; durationMs: number }> {
    const startHr = process.hrtime.bigint();
    const startTime = Date.now();

    try {
      const result = await fn();
      const endHr = process.hrtime.bigint();
      const endTime = Date.now();
      const durationMs = Math.max(0.12, parseFloat((Number(endHr - startHr) / 1_000_000).toFixed(2)));

      this.spans.push({
        name,
        startTime,
        endTime,
        durationMs,
        status: 'SUCCESS',
        details,
      });

      return { result, durationMs };
    } catch (err: any) {
      const endHr = process.hrtime.bigint();
      const endTime = Date.now();
      const durationMs = Math.max(0.12, parseFloat((Number(endHr - startHr) / 1_000_000).toFixed(2)));

      this.spans.push({
        name,
        startTime,
        endTime,
        durationMs,
        status: 'ERROR',
        details: err?.message || 'Error occurred during span',
      });

      throw err;
    }
  }

  /**
   * Record a synchronous span
   */
  public recordSyncSpan(name: string, durationMs: number, status: 'SUCCESS' | 'WARN' | 'ERROR' | 'SKIPPED' = 'SUCCESS', details?: string) {
    const now = Date.now();
    this.spans.push({
      name,
      startTime: now - durationMs,
      endTime: now,
      durationMs: Math.max(0.1, parseFloat(durationMs.toFixed(2))),
      status,
      details,
    });
  }

  public finish(
    decision: PipelineDecision,
    additional?: {
      threatType?: ThreatType;
      riskScore?: number;
      reliabilityScore?: number;
      status?: 'COMPLETED' | 'BLOCKED' | 'FAILED' | 'REVERTED';
    }
  ): TraceRecord {
    const totalLatencyMs = this.spans.reduce((sum, s) => sum + s.durationMs, 0);

    // Extract stage latencies
    const findSpan = (needle: string) =>
      this.spans.find((s) => s.name.toLowerCase().includes(needle.toLowerCase()))?.durationMs || 0;

    const retrievalLatencyMs = findSpan('retrieval') || findSpan('moss');
    const inputGuardrailMs = findSpan('input guardrail');
    const contextValidationMs = findSpan('context validation');
    const securityEngineMs = findSpan('security engine');
    const guardrailLatencyMs = parseFloat((inputGuardrailMs + contextValidationMs + securityEngineMs).toFixed(2));
    const evaluationLatencyMs = findSpan('evaluation') || findSpan('scorer');
    const llmLatencyMs = findSpan('agent') || findSpan('llm');
    const toolLatencyMs = findSpan('tool');

    const record: TraceRecord = {
      id: this.traceId,
      timestamp: new Date().toISOString(),
      query: this.query,
      decision,
      totalLatencyMs: parseFloat(totalLatencyMs.toFixed(2)),
      retrievalLatencyMs,
      guardrailLatencyMs,
      evaluationLatencyMs,
      llmLatencyMs,
      toolLatencyMs,
      spans: [...this.spans],
      threatType: additional?.threatType,
      riskScore: additional?.riskScore,
      reliabilityScore: additional?.reliabilityScore,
      status: additional?.status || (decision === 'BLOCK' ? 'BLOCKED' : 'COMPLETED'),
    };

    return record;
  }
}

/**
 * Calculates p50 and p95 percentiles from an array of numbers
 */
export function calculatePercentiles(latencies: number[]): { p50: number; p95: number } {
  if (latencies.length === 0) return { p50: 0, p95: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const p50Index = Math.floor(sorted.length * 0.5);
  const p95Index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));

  return {
    p50: parseFloat(sorted[p50Index].toFixed(2)),
    p95: parseFloat(sorted[p95Index].toFixed(2)),
  };
}
