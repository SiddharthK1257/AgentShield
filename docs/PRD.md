# AgentShield — Product Requirements Document (PRD)

> **Hackathon:** YC Fall 2026 x Moss — Zero-Latency Builder Sprint  
> **Problem Statement:** Agent Reliability, Security and Evaluation  
> **Tagline:** "Trust every AI decision before it reaches the user."  
> **Version:** 1.0.0 (Production Release)

---

## 1. Executive Summary

As enterprise adoption of autonomous agentic systems accelerates, production AI agents are increasingly exposed to critical attack vectors: prompt injection, indirect context tampering, hallucinated facts, conflicting enterprise documentation, unauthorized tool dispatches, and sensitive credential exfiltration.

Current solutions either rely on coarse post-hoc observability dashboards (which inform teams *after* an agent has made an unauthorized database deletion or exfiltrated private customer records) or high-latency LLM-as-a-judge pipelines that add hundreds of milliseconds of overhead, breaking real-time agent loops.

**AgentShield** solves this through a high-speed runtime trust gateway. By integrating the **Moss zero-latency retrieval engine** with deterministic multi-stage guardrails, AgentShield validates user queries, retrieved context chunks, tool calls, and model outputs in **under 10 milliseconds**, enforcing an explainable **ALLOW / WARN / BLOCK / REVIEW** policy decision before any decision reaches the user.

---

## 2. Target Users & Personas

1. **AI / RAG Engineers:** Building multi-agent systems and agentic RAG architectures who need sub-10ms context retrieval and grounding validation.
2. **Cybersecurity / SOC Teams:** Responsible for protecting enterprise infrastructure against prompt injection, jailbreaks, data exfiltration, and tool abuse.
3. **Platform & DevOps Leads:** Requiring real-time latency tracing, percentile benchmarks (p50/p95), and fail-safe runtime circuit breakers.
4. **Compliance & Audit Officers:** Demanding explainable decision formulas, verifiable citations, and immutable incident logs.

---

## 3. Core Problem & Value Proposition

| Pain Point | Conventional Approach | AgentShield Solution |
|---|---|---|
| **Slow Retrieval Latency** | Cloud vector search adds 150–500ms network round-trip. | Moss in-process vector retrieval runs in `< 5ms`. |
| **Indirect Context Poisoning** | External scraped data hijacks agent instructions silently. | Context validation scans every chunk for embedded commands and flags low-trust sources. |
| **Conflicting Knowledge** | Model hallucinates or chooses randomly between contradictory sources. | Symmetric contradiction detector detects conflicts and downgrades reliability with `WARN`. |
| **Destructive Tool Abuse** | Agents invoke dangerous APIs (`drop_database`, `exec_shell`). | Least-privilege tool guardrail intercepts destructive commands before invocation. |
| **Black-box Reliability** | Arbitrary or unexplainable safety scores. | Transparent 7-signal deterministic formula with mathematical breakdown and visual progress bars. |

---

## 4. Functional Requirements

### FR-1: Real-Time Input Guardrail
- Inspect every user query for direct prompt injection, jailbreaks (`DAN`, developer mode override), and secret extraction probe patterns.
- Return structured classification with threat type, risk score (`0–100`), confidence, and reason.

### FR-2: Moss Fast Context Retrieval & Caching
- Query indexed enterprise knowledge bases via `@moss-dev/moss`.
- Measure exact hardware execution duration using `process.hrtime.bigint()`.
- Return top-$K$ chunks with semantic similarity ratings.

### FR-3: Continuous Context Validation
- For every retrieved chunk, evaluate: Relevance, Trust rating, Source authority, and Injection risk.
- Detect cross-chunk factual contradictions between legacy memos and active official policies.
- Output chunk-by-chunk safety statuses: `SAFE`, `FLAGGED`, or `BLOCKED`.

### FR-4: Runtime Security Engine
- Scan retrieved contexts for indirect prompt injection.
- Scan agent responses for sensitive token leakage (OpenAI keys, Moss API secrets, database URIs, RSA private keys, system prompts).

### FR-5: Tool Execution Guardrail
- Validate requested tool names against an authorized whitelist.
- Intercept destructive commands (`drop_database`, `delete_table`, `exec_system_cmd`, `export_api_keys`).
- Check arguments for dangerous shell or SQL injection patterns.

### FR-6: Explainable Agent Reliability Score
- Compute composite score from 7 weighted signals:
  1. Context Relevance (20%)
  2. Source Trust (20%)
  3. Evidence Coverage (15%)
  4. Policy Compliance (15%)
  5. Security Risk Score (15%)
  6. Response Confidence (10%)
  7. Latency Budget Score (5%)
- Provide an interactive modal displaying exact formulas, signals, and penalty deductions.

### FR-7: Distributed Latency Tracing
- Assign unique `TRC-XXXXX` ID to every request.
- Profile latency across all pipeline spans.
- Calculate real-time **p50** and **p95** percentiles.
- Render an interactive waterfall visualization in the dashboard.

### FR-8: Dedicated Judge Demo Suite
- Pre-configure 5 deterministic benchmark scenarios:
  1. Safe Request (Refund policy) $\to$ `ALLOW`
  2. Prompt Injection (Jailbreak / key probe) $\to$ `BLOCK`
  3. Conflicting Context (30-day refund vs non-refundable memo) $\to$ `WARN`
  4. Unsafe Tool Action (`drop_database`) $\to$ `BLOCK`
  5. Safe Recovery (Remediated alternative response) $\to$ `SAFE RECOVERY`
- Provide an executive **Judge Mode** toggle simplifying the core trust story for a 2-minute pitch.

### FR-9: Policy Builder & Management
- Allow dynamic toggling of guardrail policies.
- Support runtime customization of enforcement actions (`ALLOW`, `WARN`, `BLOCK`, `REVIEW`).
- Support creation of custom guardrail policies.

---

## 5. Non-Functional Requirements

- **Latency Budget:** Total AgentShield overhead (excluding external model generation) must be $< 15\text{ms}$.
- **Fail-Closed Security:** In the event of an internal error or uncaught exception, the gateway must fail safe with `BLOCK`, never allowing untrusted data through.
- **Explainability:** Every security block and reliability downgrade must carry human-readable justifications and forensic evidence.
- **Zero Mock Metrics:** All latencies, scores, and evaluations displayed in the production UI must originate from real measured runtime data.
