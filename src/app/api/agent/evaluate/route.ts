import { NextRequest, NextResponse } from 'next/server';
import { ReliabilityScorer } from '@/lib/evaluation/scorer';
import { mossService } from '@/lib/moss/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, response, contexts } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const startHr = process.hrtime.bigint();
    const validation = await mossService.validateContext(contexts || []);
    const evidence = await mossService.searchEvidence(response || prompt, contexts || []);
    const endHr = process.hrtime.bigint();
    const totalLatencyMs = Number(endHr - startHr) / 1_000_000;

    const reliability = ReliabilityScorer.calculate({
      contextRelevance: validation.relevanceScore,
      sourceTrust: validation.trustScore,
      evidenceCoverage: evidence.coverage,
      policyCompliant: true,
      securityRisk: validation.injectionRiskScore,
      responseConfidence: 90,
      totalLatencyMs,
      hasContradiction: validation.contradictionDetected,
    });

    return NextResponse.json({
      evaluation: {
        score: reliability.overall,
        passed: reliability.passed,
        grade: reliability.grade,
        breakdown: reliability.breakdown,
        explanation: reliability.explanation,
        evidence: evidence.evidence,
        latencyMs: parseFloat(totalLatencyMs.toFixed(2)),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Evaluation failed' }, { status: 500 });
  }
}
