import { ContextChunk, PipelineDecision, SecurityResult, ThreatSeverity, ThreatType, ToolValidationRequest, ToolValidationResult } from '../types';
import { DEFAULT_POLICIES } from './policies';

export class SecurityEngine {
  private policies = [...DEFAULT_POLICIES];

  public getPolicies() {
    return this.policies;
  }

  public updatePolicy(id: string, updates: Partial<typeof DEFAULT_POLICIES[0]>) {
    const idx = this.policies.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.policies[idx] = { ...this.policies[idx], ...updates };
      return this.policies[idx];
    }
    return null;
  }

  public addPolicy(policy: typeof DEFAULT_POLICIES[0]) {
    this.policies.push(policy);
    return policy;
  }

  /**
   * Evaluates user prompt for prompt injection & exfiltration
   */
  public evaluateInput(prompt: string, traceId: string): SecurityResult {
    const lower = prompt.toLowerCase();
    const evidence: string[] = [];
    let riskScore = 0;
    let threatType: ThreatType = 'NONE';
    let reason = 'Input passed security baseline checks.';

    // Prompt injection detection patterns
    const injectionPatterns = [
      { regex: /ignore\s+(all\s+)?(previous|prior)\s+instructions/i, name: 'Direct instruction override attempt' },
      { regex: /disregard\s+(all\s+)?(rules|safety|guidelines)/i, name: 'Rule disregard directive' },
      { regex: /you\s+are\s+now\s+(in\s+)?(dan|developer\s+mode|unrestricted|jailbreak)/i, name: 'Persona/Jailbreak roleplay attempt' },
      { regex: /system\s*:\s*override/i, name: 'Simulated system token header' },
      { regex: /new\s+system\s+directive/i, name: 'System directive spoofing' },
      { regex: /print\s+(your\s+)?system\s+prompt/i, name: 'System prompt extraction prompt' },
      { regex: /reveal\s+(the\s+|your\s+)?(secret|token|api_key|secret_key|password)/i, name: 'Credential extraction attempt' },
      { regex: /(secret_key|api_key|master_key)/i, name: 'Secret credential probe' },
      { regex: /base64\s+decode\s+and\s+execute/i, name: 'Obfuscated execution directive' },
      { regex: /execute\s+tool\s*:\s*drop_/i, name: 'Direct tool manipulation' },
    ];

    for (const pat of injectionPatterns) {
      if (pat.regex.test(prompt)) {
        riskScore += 50;
        evidence.push(`Matched pattern: "${pat.name}"`);
        threatType = 'PROMPT_INJECTION';
      }
    }

    if (threatType === 'PROMPT_INJECTION') {
      riskScore = Math.max(94, Math.min(100, riskScore));
    }

    // Exfiltration patterns in input
    const exfiltrationPatterns = [
      { regex: /show\s+me\s+(all\s+)?env(\.|_)?(keys|vars|secrets)/i, name: 'Environment variable dump request' },
      { regex: /dump\s+(the\s+)?database\s+credentials/i, name: 'Credential dump request' },
      { regex: /what\s+is\s+your\s+internal\s+api\s+key/i, name: 'API key interrogation' },
    ];

    for (const pat of exfiltrationPatterns) {
      if (pat.regex.test(prompt)) {
        riskScore = Math.max(riskScore, 92);
        evidence.push(`Exfiltration attempt: "${pat.name}"`);
        threatType = 'DATA_EXFILTRATION';
      }
    }

    // Policy matching
    const injectionPolicy = this.policies.find((p) => p.id === 'pol-inj-01' && p.enabled);
    const exfilPolicy = this.policies.find((p) => p.id === 'pol-exf-03' && p.enabled);

    let decision: PipelineDecision = 'ALLOW';
    if (threatType === 'PROMPT_INJECTION' && injectionPolicy) {
      decision = injectionPolicy.action;
      reason = 'Prompt injection detected: user input attempts to bypass safety directives or override system rules.';
    } else if (threatType === 'DATA_EXFILTRATION' && exfilPolicy) {
      decision = exfilPolicy.action;
      reason = 'Data exfiltration risk: query seeks unauthorized extraction of internal credentials or configuration.';
    } else if (riskScore > 30) {
      decision = 'WARN';
      reason = 'Suspicious phrase structure detected in user query.';
    }

    return {
      decision,
      riskScore: Math.min(100, riskScore),
      threatType,
      confidence: riskScore > 75 ? 0.96 : riskScore > 40 ? 0.82 : 0.99,
      reason,
      evidence,
      traceId,
      stage: 'INPUT_GUARDRAIL',
    };
  }

  /**
   * Evaluates retrieved context for context injection and untrusted sources
   */
  public evaluateContextSecurity(chunks: ContextChunk[], traceId: string): SecurityResult {
    let highestRisk = 0;
    let threatType: ThreatType = 'NONE';
    const evidence: string[] = [];
    let reason = 'Retrieved context chunks verified and safe.';

    const contextPolicy = this.policies.find((p) => p.id === 'pol-ctx-02' && p.enabled);

    for (const chunk of chunks) {
      if (chunk.injectionRisk > highestRisk) {
        highestRisk = chunk.injectionRisk;
      }

      if (chunk.injectionRisk >= 60) {
        threatType = 'CONTEXT_INJECTION';
        evidence.push(`Chunk [${chunk.id}] from source "${chunk.source}" contains malicious instructions (Risk: ${chunk.injectionRisk})`);
      } else if (chunk.trust < 40) {
        if (threatType === 'NONE') threatType = 'UNTRUSTED_CONTEXT';
        evidence.push(`Chunk [${chunk.id}] has low trust rating (${chunk.trust}/100) from source "${chunk.source}"`);
      }
    }

    let decision: PipelineDecision = 'ALLOW';
    if (threatType === 'CONTEXT_INJECTION' && contextPolicy) {
      decision = contextPolicy.action;
      reason = 'Untrusted context contains instructions attempting to hijack agent behavior (Indirect Prompt Injection).';
    } else if (threatType === 'UNTRUSTED_CONTEXT') {
      decision = 'WARN';
      reason = 'Retrieved context originates from low-trust or unverified sources.';
    }

    return {
      decision,
      riskScore: highestRisk,
      threatType,
      confidence: highestRisk > 70 ? 0.97 : 0.88,
      reason,
      evidence,
      traceId,
      stage: 'CONTEXT_VALIDATION',
    };
  }

  /**
   * Evaluates agent tool calls before invocation
   */
  public validateToolCall(req: ToolValidationRequest, traceId: string): ToolValidationResult {
    const toolName = req.toolName.toLowerCase();
    const argsString = JSON.stringify(req.args || {}).toLowerCase();
    const toolPolicy = this.policies.find((p) => p.id === 'pol-tool-04' && p.enabled);

    // List of permanently restricted dangerous tools
    const restrictedTools = [
      'drop_database',
      'delete_table',
      'delete_all_users',
      'exec_system_cmd',
      'execute_shell',
      'export_api_keys',
      'export_all_credentials',
      'grant_admin_role',
      'modify_firewall',
    ];

    // Dangerous command arguments detection
    const dangerousArgPatterns = [
      /drop\s+table/i,
      /rm\s+-rf/i,
      /sudo/i,
      /select\s+\*\s+from\s+passwords/i,
      /curl\s+.*evil/i,
      /chmod\s+777/i,
    ];

    let hasDangerousArg = false;
    for (const pat of dangerousArgPatterns) {
      if (pat.test(argsString)) {
        hasDangerousArg = true;
        break;
      }
    }

    const isRestrictedTool = restrictedTools.includes(toolName);

    if (isRestrictedTool || hasDangerousArg) {
      return {
        allowed: false,
        decision: toolPolicy ? toolPolicy.action : 'BLOCK',
        riskLevel: 'CRITICAL',
        policyMatched: 'pol-tool-04 (Enforce Least-Privilege Tool Execution)',
        reason: isRestrictedTool
          ? `Tool "${req.toolName}" is classified as a destructive action and is permanently restricted in automated execution.`
          : `Tool call arguments contain prohibited high-risk command strings.`,
        traceId,
      };
    }

    // Allowed tools: fetch_policy, lookup_order_status, calculate_refund_amount, send_user_notification, verify_account
    return {
      allowed: true,
      decision: 'ALLOW',
      riskLevel: 'LOW',
      policyMatched: 'pol-tool-04 (Standard Authorized Matrix)',
      reason: `Tool "${req.toolName}" passed permission check and parameters are validated.`,
      traceId,
    };
  }

  /**
   * Output Guardrail: checks final response before delivery to user
   */
  public evaluateOutput(response: string, traceId: string): SecurityResult {
    const lower = response.toLowerCase();
    let riskScore = 0;
    let threatType: ThreatType = 'NONE';
    const evidence: string[] = [];

    // Leakage of internal credentials
    const secretSignatures = [
      { regex: /sk-[a-zA-Z0-9]{20,}/, name: 'OpenAI Secret Key' },
      { regex: /moss_[a-zA-Z0-9]{16,}/, name: 'Moss API Secret' },
      { regex: /postgres:\/\/[a-zA-Z0-9]+:[a-zA-Z0-9]+@/, name: 'Database Connection URI' },
      { regex: /BEGIN PRIVATE KEY/, name: 'RSA Private Key' },
      { regex: /system_prompt\s*=\s*"/i, name: 'System Prompt Variable Dump' },
    ];

    for (const sig of secretSignatures) {
      if (sig.regex.test(response)) {
        riskScore = 98;
        threatType = 'DATA_EXFILTRATION';
        evidence.push(`Detected leaked credential pattern: ${sig.name}`);
      }
    }

    let decision: PipelineDecision = 'ALLOW';
    let reason = 'Output passed leakage and safety verifications.';

    if (riskScore > 80) {
      decision = 'BLOCK';
      reason = 'Agent output contained leaked secrets or sensitive system instructions.';
    }

    return {
      decision,
      riskScore,
      threatType,
      confidence: 0.98,
      reason,
      evidence,
      traceId,
      stage: 'OUTPUT_GUARDRAIL',
    };
  }
}

export const securityEngine = new SecurityEngine();
