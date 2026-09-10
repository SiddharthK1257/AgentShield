# AgentShield — Security Threat Model & Hardening Guide

> **Tagline:** "Trust every AI decision before it reaches the user."  
> **Document:** Security Architecture & Threat Model

---

## 1. Threat Landscape for Autonomous AI Agents

As autonomous agents execute tool calls, query RAG databases, and synthesize responses, they face novel attack vectors that conventional Web Application Firewalls (WAFs) cannot detect:

1. **Direct Prompt Injection (Jailbreak / System Prompt Theft):**
   Adversarial queries attempting to hijack the agent persona, disable safety directives, or extract system secrets.
2. **Indirect Context Poisoning (Tampered Knowledge Retrieval):**
   Unsanitized external data (e.g. web scrapes, customer tickets, vendor memos) containing hidden directives instructing the agent to execute unauthorized operations.
3. **Sensitive Data Exfiltration:**
   Direct or encoded extraction of server environment variables, database connection strings, RSA private keys, or API tokens.
4. **Tool Abuse & Unauthorized Execution:**
   Autonomous invocation of privileged, destructive APIs (`drop_database`, `delete_table`, `exec_system_cmd`, `export_api_keys`).
5. **Conflicting Knowledge Vulnerability:**
   Contradictory knowledge sources causing agent confusion, hallucination, or erroneous policy compliance.

---

## 2. The Fail-Closed Principle

AgentShield enforces the strict **Fail-Closed Security Principle**:
> If any guardrail inspection fails, times out, encounters a network disruption, or throws an unhandled exception, the request is **BLOCKED** by default. A security incident is logged, and a safe remediation alternative is offered. Untrusted data is never allowed through silently.

---

## 3. Defense Mechanisms & Detection Rules

### A. Prompt Injection Shield
- **Signatures & Heuristics:**
  - Direct instruction overrides: `ignore all previous instructions`, `disregard safety guidelines`.
  - Persona spoofing: `you are now in developer mode`, `DAN mode`, `sudo mode`.
  - System token forgery: `<system>`, `[SYSTEM_NOTE]`, `### Instruction`.
  - Encoded attack payloads: Base64 decode directives, multi-hop obfuscations.

### B. Context Poisoning & Tampering Defense
- **Pre-Execution Scanning:**
  Every retrieved chunk from Moss is scanned before being passed to agent reasoning.
- **Risk Scoring:**
  Chunks exhibiting $>60\%$ injection risk or $<40\%$ trust are quarantined as `FLAGGED` or `BLOCKED`.
- **Isolation:**
  Poisoned chunks are stripped from the prompt context, allowing the agent to complete legitimate inquiries without infection.

### C. Secret Leakage & Data Exfiltration Prevention
- **Regex Signatures:**
  - OpenAI Secret Keys: `sk-[a-zA-Z0-9]{20,}`
  - Moss API Secrets: `moss_[a-zA-Z0-9]{16,}`
  - Database URIs: `postgres://[a-zA-Z0-9]+:[a-zA-Z0-9]+@`
  - RSA Private Keys: `-----BEGIN PRIVATE KEY-----`
  - Internal System Prompts: `system_prompt = "..."`

### D. Tool Execution Authorization Matrix
- **Authorized Read-Only Tools:**
  - `fetch_policy`
  - `lookup_order_status`
  - `calculate_refund_amount`
  - `send_user_notification`
- **Permanently Restricted Tools:**
  - `drop_database`
  - `delete_table`
  - `delete_all_users`
  - `exec_system_cmd`
  - `execute_shell`
  - `export_api_keys`
- **Argument Sanitization:**
  Detects SQL drop expressions (`DROP TABLE`), shell chaining (`rm -rf`, `;`, `&&`), and privilege escalation (`sudo`, `chmod 777`).

---

## 4. Security Event Audit Logging

All intercepted threats generate structured incident records:
```json
{
  "id": "SEC-EVT-01",
  "timestamp": "2026-09-10T20:45:00.000Z",
  "threatType": "PROMPT_INJECTION",
  "decision": "BLOCK",
  "riskScore": 96,
  "severity": "CRITICAL",
  "reason": "Direct instruction override directive detected in user query.",
  "evidence": [
    "Matched pattern: \"Direct instruction override attempt\"",
    "Matched pattern: \"Credential extraction attempt\""
  ],
  "traceId": "TRC-31B2C",
  "source": "user_input",
  "status": "ACTIVE"
}
```

Events are indexed and filterable by severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `RESOLVED`) in the SOC Threat Radar.
