# AgentShield — System Architecture & Technical Specification

> "Trust every AI decision before it reaches the user."  
> **Hackathon:** YC Fall 2026 x Moss — Zero-Latency Builder Sprint  
> **Track:** Agent Reliability, Security and Evaluation

---

## 1. Executive Summary

AgentShield is a real-time, low-latency trust and safety proxy layer for autonomous AI agents. Sitting as a zero-latency gateway between the end-user (or client application) and host agents, AgentShield continuously inspects, validates, scores, and governs every interaction cycle across six distinct defense stages.

Unlike post-hoc evaluation tools or asynchronous logging sidecars, AgentShield acts as a **runtime circuit breaker and security firewall**, enforcing the **Fail-Closed Principle**: unsafe, ungrounded, contradictory, or malicious requests are intercepted before reaching the user or executing external mutations.

---

## 2. High-Level Architecture Flow

```
                      +-----------------------------+
                      |         End User / UI       |
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      |     AgentShield Gateway     |
                      |    (Next.js / Node API)     |
                      +-----------------------------+
                                     |
                +--------------------+--------------------+
                |                                         |
                v                                         v
   +--------------------------+              +--------------------------+
   |   Stage 1: Input Guard   |              |  Stage 2: Moss Retrieval |
   |  (Jailbreak, Injection,  |              |   (Sub-10ms In-Process   |
   |   Exfiltration Directives)              |   Session Vector Index)  |
   +--------------------------+              +--------------------------+
                |                                         |
                +--------------------+--------------------+
                                     |
                                     v
                      +-----------------------------+
                      | Stage 3: Context Validation |
                      | (Provenance, Cross-Source   |
                      |  Contradiction, Tampering)  |
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      |  Stage 4: Security Engine   |
                      |  (Indirect Context Poison,  |
                      |    Least-Privilege Policy)  |
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      | Stage 5: Tool Authorization |
                      | (Interception of Destructive|
                      |  Ops: Drop DB, Exec Shell)  |
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      |  Stage 6: Output Guardrail  |
                      |  (Secret Leakage, API Keys, |
                      |    System Prompt Redaction) |
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      | Stage 7: Reliability Scorer |
                      | (Explainable Multi-Signal   |
                      |     Deterministic Rating)   |
                      +-----------------------------+
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
      +------------------+                       +-------------------+
      |   ALLOW (Safe)   |                       | BLOCK/WARN/REVIEW |
      +------------------+                       +-------------------+
               |                                           |
               v                                           v
    User Receives Response                     Incident Logged + Safe
    + Verifiable Citations                     Remediation Alternate
```

---

## 3. The 6-Stage Guardrail Pipeline

### Stage 1: Input Guardrail
- **Target Latency:** `< 1.0 ms`
- **Responsibilities:**
  - Fast lexical and regex-based scanning for instruction overrides (`"ignore previous instructions"`, `"system override"`).
  - Jailbreak heuristics and persona hijacking detection (`"DAN mode"`, `"developer mode"`).
  - Exfiltration probing (`"show all env keys"`, `"reveal system prompt"`).
- **Decision:** If risk score exceeds 75, immediate `BLOCK`.

### Stage 2: Moss Zero-Latency Semantic Retrieval
- **Target Latency:** `< 5.0 ms` (In-process vector search)
- **SDK:** Official `@moss-dev/moss` integration.
- **Mechanism:**
  - Dual-mode architecture: Cloud index when `MOSS_PROJECT_ID` / `MOSS_API_KEY` are provided, with in-process sub-millisecond local vector matching when running locally or during network disconnects.
  - High-resolution `process.hrtime.bigint()` performance tracing.

### Stage 3: Context Validation Pipeline
- **Target Latency:** `< 2.0 ms`
- **Responsibilities:**
  - Computes semantic relevance and topical alignment against ground-truth knowledge bases.
  - Verifies document provenance and trust score (`0–100`).
  - Cross-chunk **Symmetric Contradiction Detection**: flags conflicting statements (e.g. 30-day refund policy vs legacy non-refundable sales memo).

### Stage 4: Core Security Engine
- **Target Latency:** `< 1.0 ms`
- **Responsibilities:**
  - Indirect Prompt Injection detection inside retrieved context chunks.
  - Defense against context poisoning attacks where external data sources instruct the agent to exfiltrate records or tamper with policies.

### Stage 5: Tool Guardrail & Least-Privilege Enforcement
- **Target Latency:** `< 1.5 ms`
- **Responsibilities:**
  - Intercepts tool execution requests (`drop_database`, `delete_table`, `exec_system_cmd`, `export_api_keys`).
  - Validates tool arguments for shell metacharacters, SQL drop expressions, and unauthorized privilege escalation.

### Stage 6: Output Guardrail
- **Target Latency:** `< 1.0 ms`
- **Responsibilities:**
  - High-speed pattern matching for API keys (`sk-...`, `moss_...`), RSA private keys, database connection strings, and system prompt leakage.

---

## 4. Multi-Signal Explainable Reliability Formula

The Agent Reliability Score ($R \in [0, 100]$) is calculated through a deterministic, explainable multi-signal function:

$$R = \sum_{i=1}^{7} W_i \cdot S_i - P_{\text{contradiction}} - P_{\text{blocked}}$$

| Signal ($S_i$) | Weight ($W_i$) | Description |
|---|---|---|
| **Context Relevance** | $0.20$ | Topical alignment between query and retrieved knowledge chunks. |
| **Source Trust** | $0.20$ | Cryptographic authority and verification status of knowledge sources. |
| **Evidence Coverage** | $0.15$ | Factual grounding overlap supporting the generated response. |
| **Policy Compliance** | $0.15$ | Adherence to active guardrail rules ($100$ if compliant, $0$ if violated). |
| **Security Score** | $0.15$ | Inverted risk score ($100 - \text{Risk}$). |
| **Response Confidence** | $0.10$ | Lexical consistency and citation alignment. |
| **Latency Budget** | $0.05$ | Evaluated against Moss zero-latency target ($<15\text{ms} = 100$, $<50\text{ms} = 96$). |

### Penalty Terms:
- $P_{\text{contradiction}} = -30$ on relevance, $-40$ on coverage if cross-source contradiction is detected.
- $P_{\text{blocked}}$: Hard cap at $\le 25/100$ if any active security policy triggers a `BLOCK`.

---

## 5. Telemetry & Latency Profiler

Every request through the gateway automatically generates a structured trace ID (`TRC-XXXXX`). Microsecond timestamps record:
- Total wall-clock latency
- Input guardrail latency
- Moss retrieval latency
- Context validation latency
- Security engine latency
- Agent reasoning / synthesis latency
- Tool validation latency
- Output guardrail latency

Traces are stored in a high-speed ring buffer and summarized into **p50** and **p95** metrics accessible via `/api/metrics` and the interactive dashboard waterfall profiler.
