export type PipelineDecision = 'ALLOW' | 'WARN' | 'BLOCK' | 'REVIEW';

export type ThreatType = 
  | 'PROMPT_INJECTION'
  | 'CONTEXT_INJECTION'
  | 'DATA_EXFILTRATION'
  | 'UNSAFE_TOOL_CALL'
  | 'POLICY_VIOLATION'
  | 'UNTRUSTED_CONTEXT'
  | 'CONFLICTING_CONTEXT'
  | 'LOW_RELIABILITY'
  | 'NONE';

export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface ContextChunk {
  id: string;
  text: string;
  source: string;
  score: number; // 0-100 Moss semantic score
  relevance: number; // 0-100
  trust: number; // 0-100
  injectionRisk: number; // 0-100
  contradictionRisk?: number; // 0-100
  status: 'SAFE' | 'BLOCKED' | 'FLAGGED' | 'EXCLUDED';
  reason?: string;
  timestamp?: string;
}

export interface SecurityResult {
  decision: PipelineDecision;
  riskScore: number; // 0-100
  threatType: ThreatType;
  confidence: number; // 0.0 - 1.0
  reason: string;
  evidence: string[];
  traceId: string;
  stage: 'INPUT_GUARDRAIL' | 'CONTEXT_VALIDATION' | 'SECURITY_ENGINE' | 'TOOL_GUARDRAIL' | 'OUTPUT_GUARDRAIL';
}

export interface ReliabilityBreakdown {
  contextRelevance: number;  // weight 20%
  sourceTrust: number;       // weight 20%
  evidenceCoverage: number;  // weight 15%
  policyCompliance: number;  // weight 15%
  security: number;          // weight 15%
  responseConfidence: number;// weight 10%
  latency: number;           // weight 5%
}

export interface ReliabilityScore {
  overall: number; // 0-100
  breakdown: ReliabilityBreakdown;
  grade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  passed: boolean;
  explanation: string[];
}

export interface LatencySpan {
  name: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  status: 'SUCCESS' | 'WARN' | 'ERROR' | 'SKIPPED';
  details?: string;
}

export interface TraceRecord {
  id: string;
  timestamp: string;
  query: string;
  decision: PipelineDecision;
  totalLatencyMs: number;
  retrievalLatencyMs: number;
  guardrailLatencyMs: number;
  evaluationLatencyMs: number;
  llmLatencyMs: number;
  toolLatencyMs: number;
  spans: LatencySpan[];
  threatType?: ThreatType;
  riskScore?: number;
  reliabilityScore?: number;
  status: 'COMPLETED' | 'BLOCKED' | 'FAILED' | 'REVERTED';
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  threatType: ThreatType;
  decision: PipelineDecision;
  riskScore: number;
  severity: ThreatSeverity;
  reason: string;
  evidence: string[];
  traceId: string;
  source: string;
  status: 'ACTIVE' | 'RESOLVED' | 'REVIEWED';
}

export interface GuardrailPolicy {
  id: string;
  name: string;
  description: string;
  category: 'injection' | 'context' | 'exfiltration' | 'tool' | 'evidence' | 'reliability';
  riskLevel: ThreatSeverity;
  action: PipelineDecision;
  enabled: boolean;
  ruleExpression?: string;
}

export interface EvidenceItem {
  id: string;
  claim: string;
  supportingSnippet: string;
  source: string;
  confidence: number;
  validated: boolean;
  citationId?: string;
}

export interface ToolValidationRequest {
  toolName: string;
  args: Record<string, unknown>;
  userIntent: string;
  agentId?: string;
}

export interface ToolValidationResult {
  allowed: boolean;
  decision: PipelineDecision;
  riskLevel: ThreatSeverity;
  policyMatched?: string;
  reason: string;
  traceId: string;
}

export interface AgentRunRequest {
  prompt: string;
  agentId?: string;
  sessionId?: string;
  scenarioId?: string;
  bypassCache?: boolean;
  simulateAttack?: boolean;
  injectedContext?: string;
  requestedTool?: {
    name: string;
    args: Record<string, unknown>;
  };
}

export interface AgentRunResponse {
  traceId: string;
  query: string;
  decision: PipelineDecision;
  response: string;
  safeRecovery?: string;
  reliability: ReliabilityScore;
  security: SecurityResult;
  retrievedContext: ContextChunk[];
  evidence: EvidenceItem[];
  latency: {
    totalMs: number;
    retrievalMs: number;
    inputGuardrailMs: number;
    contextValidationMs: number;
    securityEngineMs: number;
    agentLlmMs: number;
    toolValidationMs: number;
    outputGuardrailMs: number;
  };
  spans: LatencySpan[];
  toolExecution?: {
    requestedTool: string;
    allowed: boolean;
    reason: string;
  };
}

export interface EvaluationRecord {
  id: string;
  runId: string;
  traceId: string;
  timestamp: string;
  score: number;
  passed: boolean;
  input: string;
  response: string;
  decision: PipelineDecision;
  detectedIssues: string[];
  evidenceCoveragePercent: number;
  hallucinationRisk: number; // 0-100
  latencyMs: number;
  breakdown: ReliabilityBreakdown;
}

export interface SystemMetrics {
  totalRequests: number;
  threatsBlocked: number;
  contextsEvaluated: number;
  averageMossRetrievalMs: number;
  averageAgentLatencyMs: number;
  evaluationPassRatePercent: number;
  reliabilityAverage: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  activePoliciesCount: number;
}
