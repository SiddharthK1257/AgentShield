# AgentShield — Project Audit & Architecture Plan

**Project:** AgentShield  
**Tagline:** "Trust every AI decision before it reaches the user."  
**Hackathon:** YC Fall 2026 x Moss — Zero-Latency Builder Sprint  
**Track:** AGENT RELIABILITY, SECURITY AND EVALUATION  
**Date:** September 2026  
**Auditor:** AgentShield Core Engineering Team  

---

## 1. Current Architecture & Workspace Status

### Workspace Inspection
- **Directory:** `D:\AgentShield`
- **Initial State:** Pristine / Greenfield repository. No legacy, conflicting, or deprecated code exists.
- **Runtime Environment:** 
  - **Node.js:** `v24.19.0` (LTS/Current modern runtime with native ES modules, async disposal, high-performance crypto, and fetch).
  - **NPM:** `11.17.0`.
  - **OS:** Windows Server / Windows 11 environment.
  - **Moss SDK Verified:** `@moss-dev/moss@1.7.1` (Official InferEdge / Moss real-time semantic search client supporting sub-millisecond in-process retrieval, vector indexing, and hybrid search).

---

## 2. Selected Tech Stack

To ensure **zero-latency overhead**, strict type safety, developer-grade observability, and unified deployment, the following stack is selected:

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14 / App Router (TypeScript) | Full-stack serverless/Node runtime, unified API routes (`/api/*`), fast SSR + client hydration. |
| **Styling & UI** | Tailwind CSS + Lucide Icons + Custom Modern Dark Design System | SOC / Observability console aesthetics (Slate/Zinc, Emerald, Amber, Crimson), high contrast, micro-interactions, responsive. |
| **Retrieval Engine** | Official Moss SDK (`@moss-dev/moss`) + `MossService` Abstraction | Real-time in-process sub-10ms semantic search, continuous context evaluation, latency benchmarking, and hybrid keyword+vector search. |
| **Guardrails & Security Engine** | Real-time Runtime AgentShield Engine | Multi-stage pipeline: Input guardrail, Context validator, Security engine (injection, exfiltration, policy, tool abuse), Output guardrail. |
| **Evaluation & Reliability** | Explainable Weighted Multi-Signal Scoring Engine | Deterministic 0–100 scoring based on relevance, source trust, evidence coverage, policy compliance, security, confidence, and latency. |
| **State & Persistence** | In-Memory Thread-Safe Store + Persistence Adapter | Zero disk I/O bottleneck for high-frequency tracing, audit logs, evaluations, and policy configurations; supports file/DB export. |
| **Testing** | Node.js Test Runner / Vitest | Automated testing covering all 10 required test cases (injections, conflicting context, tool abuse, reliability calculation, latency tracing). |

---

## 3. Reusable Components & Design Patterns

We will implement modular, reusable core modules:
1. **`MossService` (`src/lib/moss/service.ts`)**:
   - `retrieveContext(query, options)`: Interacts with Moss index to fetch semantically relevant chunks with real microsecond latency tracking.
   - `searchEvidence(claim, contexts)`: Verifies factual claims against indexed knowledge sources.
   - `validateContext(chunks)`: Checks context integrity, source authenticity, and tamper indicators.
   - `evaluateContext(query, chunks)`: Evaluates topical relevance, noise ratio, and semantic divergence.
   - `measureLatency(fn)`: High-resolution `process.hrtime.bigint()` performance counter.

2. **`SecurityEngine` (`src/lib/security/engine.ts`)**:
   - Prompt injection detector (jailbreaks, instructions override, role reversal, base64/rot13 obfuscation).
   - Context injection detector (hidden instructions inside retrieved knowledge chunks).
   - Data exfiltration detector (API key patterns, environment secrets, private database connection strings, system prompts).
   - Tool abuse guard (permission matrix, dangerous shell commands, SQL drops, file deletion, unauthorized privileges).
   - Policy enforcer (configurable rulebook with ALLOW, WARN, BLOCK, REVIEW actions).

3. **`ReliabilityScorer` (`src/lib/evaluation/scorer.ts`)**:
   - Explainable calculation breakdown:
     - Context Relevance ($W_1 = 0.20$)
     - Source Trust ($W_2 = 0.20$)
     - Evidence Coverage ($W_3 = 0.15$)
     - Policy Compliance ($W_4 = 0.15$)
     - Security Risk ($W_5 = 0.15$)
     - Response Confidence ($W_6 = 0.10$)
     - Latency Budget Score ($W_7 = 0.05$)

4. **`TraceManager` (`src/lib/observability/tracer.ts`)**:
   - Trace creation, distributed span recording, p50/p95 percentile aggregators, and waterfall visualization data.

5. **`AgentSimulator` (`src/lib/agent/simulator.ts`)**:
   - Realistic agent runtime with tool-calling capabilities (`lookup_refund_policy`, `check_order_status`, `execute_database_query`, `send_user_notification`).

---

## 4. Files That Will Be Added

```text
D:\AgentShield\
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── README.md
├── docs/
│   ├── PROJECT_AUDIT.md
│   ├── ARCHITECTURE.md
│   ├── PRD.md
│   ├── SECURITY.md
│   ├── EVALUATION.md
│   ├── DEMO_SCRIPT.md
│   └── architecture-diagram.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── health/route.ts
│   │       ├── agent/
│   │       │   ├── run/route.ts
│   │       │   └── evaluate/route.ts
│   │       ├── security/
│   │       │   ├── check/route.ts
│   │       │   └── events/route.ts
│   │       ├── context/
│   │       │   └── validate/route.ts
│   │       ├── retrieval/
│   │       │   └── search/route.ts
│   │       ├── tool/
│   │       │   └── validate/route.ts
│   │       ├── traces/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── evaluations/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── metrics/route.ts
│   │       └── policies/route.ts
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── MetricCard.tsx
│   │   ├── ReliabilityModal.tsx
│   │   ├── LatencyWaterfall.tsx
│   │   ├── JudgeDemoBar.tsx
│   │   ├── tabs/
│   │   │   ├── OverviewTab.tsx
│   │   │   ├── LiveAgentTab.tsx
│   │   │   ├── SecurityTab.tsx
│   │   │   ├── ContextTab.tsx
│   │   │   ├── EvaluationsTab.tsx
│   │   │   ├── TracesTab.tsx
│   │   │   ├── EvidenceTab.tsx
│   │   │   ├── PoliciesTab.tsx
│   │   │   └── SettingsTab.tsx
│   ├── lib/
│   │   ├── types.ts
│   │   ├── store.ts
│   │   ├── moss/
│   │   │   ├── client.ts
│   │   │   ├── service.ts
│   │   │   └── mockData.ts
│   │   ├── security/
│   │   │   ├── engine.ts
│   │   │   ├── injectionRules.ts
│   │   │   ├── exfiltrationRules.ts
│   │   │   └── toolRules.ts
│   │   ├── evaluation/
│   │   │   ├── scorer.ts
│   │   │   └── validator.ts
│   │   ├── agent/
│   │   │   └── simulator.ts
│   │   └── observability/
│   │       └── tracer.ts
└── tests/
    └── agentShield.test.ts
```

---

## 5. Integration Strategy

1. **Phase 1 (Foundation):** Set up Next.js 14/15, Tailwind CSS, TypeScript, and unified types.
2. **Phase 2 (Moss Integration):** Implement `MossService` wrapping `@moss-dev/moss`. Pre-load verified knowledge bases (enterprise refund policies, support guidelines, security manuals) with sub-10ms query capability.
3. **Phase 3 & 4 (Security & Context Engine):** Build detection modules for prompt injection, context injection, data exfiltration, conflicting knowledge sources, and tool execution policy checks.
4. **Phase 5 & 6 (Scorer & Latency Tracer):** Implement explainable reliability scoring (0–100) and microsecond-precision distributed span tracking with p50/p95 calculations.
5. **Phase 7 & 8 (Observability UI & Judge Demo Mode):** Build the dark-themed SOC-grade dashboard featuring the 5 pre-configured judging scenarios (Safe, Prompt Injection, Conflicting Context, Unsafe Tool, Safe Recovery).
6. **Phase 9–16 (APIs & Full Tabs):** Connect all 10 dashboard sections to real backend routes.
7. **Phase 17–28 (Testing, QA & Documentation):** Implement automated test suite, verify production build, generate complete PRD, Architecture, Security, and Demo scripts.

---

## 6. Risks & Mitigations

| Risk | Mitigation Strategy |
|---|---|
| Cloud Moss credentials not set in local demo | Provide seamless dual-mode in `MossService`: if `MOSS_PROJECT_ID` / `MOSS_API_KEY` are provided, connect to Moss Cloud; otherwise initialize `@moss-dev/moss` in-process session index, ensuring real sub-millisecond vector retrieval without network failure. |
| Heavy latency tracing causing UI lag | Store traces in high-speed circular in-memory buffer; serialize lightweight telemetry payloads to the UI with millisecond-exact timestamps. |
| Security engine false positives | Tune threat heuristics with weighted confidence thresholds ($0.0 - 1.0$), categorize decisions into `ALLOW`, `WARN`, `BLOCK`, `REVIEW` with clear explainable justifications. |
| Judge understanding in under 2 minutes | Include a top-level **"Judge Mode"** bar with 1-click execution for the 5 benchmark scenarios, showing real-time pipeline waterfall, risk radar, and recovery flow. |

---

## 7. Implementation Plan Checklist

- [x] Phase 0: Workspace audit & `/docs/PROJECT_AUDIT.md`
- [x] Phase 1: Product architecture & data contracts (`types.ts`)
- [x] Phase 2: Official Moss SDK integration (`MossService` & index builder)
- [x] Phase 3: Core Security Engine (Injection, Exfiltration, Tool Abuse)
- [x] Phase 4: Context Validation Pipeline (Relevance, Trust, Contradiction)
- [x] Phase 5: Transparent Reliability Scoring Formula
- [x] Phase 6: Real-time Latency Tracing & Waterfall Profiler
- [x] Phase 7: Live Agent Control Room Dashboard UI (SOC/Observability theme)
- [x] Phase 8: Judge Demo Mode (5 benchmark scenarios)
- [x] Phase 9: Agent Simulator runtime with tool calling
- [x] Phase 10: Continuous Evaluation Engine & Scorecards
- [x] Phase 11: Security Event Stream & SOC Threat Radar
- [x] Phase 12: Evidence Explorer with Grounding Citations
- [x] Phase 13: Policy Builder & Guardrail Rule Manager
- [x] Phase 14: UI Polish, Micro-interactions & Accessible Contrast
- [x] Phase 15: In-Memory Datastore & Multi-Agent Schema
- [x] Phase 16: REST API Suite (`/api/*`)
- [x] Phase 17: Structured Observability & Telemetry
- [x] Phase 18: Fail-Safe Guardrail Mechanisms
- [x] Phase 19: Security Hardening & Environment Configuration
- [x] Phase 20: Automated Test Suite (10+ test scenarios)
- [x] Phase 21-23: Documentation (`README.md`, `ARCHITECTURE.md`, `PRD.md`, `SECURITY.md`, `EVALUATION.md`, `DEMO_SCRIPT.md`)
- [x] Phase 24-28: Final QA, Production Build Verification & Health Check (`/health` & `/api/health`)
