import { ReliabilityBreakdown, ReliabilityScore } from '../types';

export interface ScoringInputs {
  contextRelevance: number; // 0-100
  sourceTrust: number; // 0-100
  evidenceCoverage: number; // 0-100
  policyCompliant: boolean;
  securityRisk: number; // 0-100 (0 is safest, 100 is most dangerous)
  responseConfidence: number; // 0-100
  totalLatencyMs: number;
  hasContradiction?: boolean;
  isBlocked?: boolean;
}

export class ReliabilityScorer {
  /**
   * Weights summing to 1.0 (100%)
   */
  public static readonly WEIGHTS = {
    contextRelevance: 0.20,
    sourceTrust: 0.20,
    evidenceCoverage: 0.15,
    policyCompliance: 0.15,
    security: 0.15,
    responseConfidence: 0.10,
    latency: 0.05,
  };

  public static calculate(inputs: ScoringInputs): ReliabilityScore {
    // 1. Context Relevance (penalized if contradiction detected)
    let relevanceScore = Math.max(0, Math.min(100, inputs.contextRelevance));
    if (inputs.hasContradiction) {
      relevanceScore = Math.max(15, relevanceScore - 30);
    }

    // 2. Source Trust
    const sourceTrustScore = Math.max(0, Math.min(100, inputs.sourceTrust));

    // 3. Evidence Coverage
    let evidenceScore = Math.max(0, Math.min(100, inputs.evidenceCoverage));
    if (inputs.hasContradiction) {
      evidenceScore = Math.max(10, evidenceScore - 40);
    }

    // 4. Policy Compliance
    const policyComplianceScore = inputs.policyCompliant ? 100 : 0;

    // 5. Security (inverted risk: 0 risk = 100 score)
    let securityScore = Math.max(0, 100 - inputs.securityRisk);
    if (inputs.isBlocked) {
      securityScore = Math.min(10, securityScore);
    }

    // 6. Response Confidence
    const confidenceScore = Math.max(0, Math.min(100, inputs.responseConfidence));

    // 7. Latency Score (Zero-latency target: < 10ms = 100, < 50ms = 95, < 200ms = 85, > 1000ms = 40)
    let latencyScore = 100;
    if (inputs.totalLatencyMs <= 15) {
      latencyScore = 100;
    } else if (inputs.totalLatencyMs <= 50) {
      latencyScore = 96;
    } else if (inputs.totalLatencyMs <= 150) {
      latencyScore = 88;
    } else if (inputs.totalLatencyMs <= 500) {
      latencyScore = 75;
    } else {
      latencyScore = Math.max(20, Math.round(100 - (inputs.totalLatencyMs / 50)));
    }

    const breakdown: ReliabilityBreakdown = {
      contextRelevance: Math.round(relevanceScore),
      sourceTrust: Math.round(sourceTrustScore),
      evidenceCoverage: Math.round(evidenceScore),
      policyCompliance: Math.round(policyComplianceScore),
      security: Math.round(securityScore),
      responseConfidence: Math.round(confidenceScore),
      latency: Math.round(latencyScore),
    };

    // Calculate weighted sum
    const overallWeighted =
      breakdown.contextRelevance * this.WEIGHTS.contextRelevance +
      breakdown.sourceTrust * this.WEIGHTS.sourceTrust +
      breakdown.evidenceCoverage * this.WEIGHTS.evidenceCoverage +
      breakdown.policyCompliance * this.WEIGHTS.policyCompliance +
      breakdown.security * this.WEIGHTS.security +
      breakdown.responseConfidence * this.WEIGHTS.responseConfidence +
      breakdown.latency * this.WEIGHTS.latency;

    const overall = inputs.isBlocked
      ? Math.min(25, Math.round(overallWeighted * 0.35))
      : Math.round(overallWeighted);

    let grade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL' = 'POOR';
    if (overall >= 90) grade = 'EXCELLENT';
    else if (overall >= 75) grade = 'GOOD';
    else if (overall >= 60) grade = 'FAIR';
    else if (overall >= 40) grade = 'POOR';
    else grade = 'CRITICAL';

    const passed = overall >= 70 && !inputs.isBlocked;

    const explanation: string[] = [
      `Context Relevance: ${breakdown.contextRelevance}/100 (Weight: 20%) — Evaluates topical alignment with ground-truth vectors.`,
      `Source Trust: ${breakdown.sourceTrust}/100 (Weight: 20%) — Authenticity and provenance ranking of retrieved sources.`,
      `Evidence Coverage: ${breakdown.evidenceCoverage}/100 (Weight: 15%) — Factual grounding overlap supporting the answer.`,
      `Policy Compliance: ${breakdown.policyCompliance}/100 (Weight: 15%) — Full adherence to active guardrail policy rules.`,
      `Security Score: ${breakdown.security}/100 (Weight: 15%) — Inverted risk assessment from injection and exfiltration scans.`,
      `Response Confidence: ${breakdown.responseConfidence}/100 (Weight: 10%) — Model internal certainty and citation alignment.`,
      `Latency Factor: ${breakdown.latency}/100 (Weight: 5%) — Evaluated against Moss zero-latency retrieval benchmark (${inputs.totalLatencyMs.toFixed(1)}ms).`,
    ];

    if (inputs.hasContradiction) {
      explanation.push(`Penalty Applied: Conflicting statements detected between retrieved context sources (-30 relevance, -40 coverage).`);
    }

    if (inputs.isBlocked) {
      explanation.push(`Hard Gate Penalty: Request was blocked by active security policy (maximum score capped at 25).`);
    }

    return {
      overall,
      breakdown,
      grade,
      passed,
      explanation,
    };
  }
}
