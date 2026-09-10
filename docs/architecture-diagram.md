# AgentShield — Architecture Diagram

```mermaid
flowchart TD
    classDef client fill:#1e293b,stroke:#0284c7,stroke-width:2px,color:#fff
    classDef gateway fill:#0f172a,stroke:#6366f1,stroke-width:2px,color:#fff
    classDef guard fill:#31102f,stroke:#f43f5e,stroke-width:2px,color:#fff
    classDef moss fill:#082f49,stroke:#06b6d4,stroke-width:2px,color:#fff
    classDef agent fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff
    classDef telemetry fill:#2e1065,stroke:#a855f7,stroke-width:2px,color:#fff
    classDef decision fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#fff

    User(["👤 End User / Client App"]):::client --> WebApp["💻 Frontend / Dashboard (Next.js 14)"]:::client
    WebApp --> Gateway["🛡️ AgentShield Runtime Gateway (/api/agent/run)"]:::gateway

    subgraph Pipeline ["AgentShield Zero-Latency Runtime Trust Pipeline"]
        Gateway --> InputGuard["1. Input Guardrail<br/>(Jailbreak & Prompt Injection Scan)"]:::guard
        
        InputGuard -->|"Safe Query"| MossRet["2. Moss Fast Retrieval Engine<br/>(@moss-dev/moss Sub-10ms Index)"]:::moss
        InputGuard -.->|"Attack Detected"| BlockDecision["🚨 BLOCK / SAFE RECOVERY"]:::guard

        MossRet --> ContextVal["3. Context Validation Pipeline<br/>(Relevance, Trust, Contradictions)"]:::moss
        
        ContextVal --> SecEngine["4. Core Security Engine<br/>(Context Poisoning & Exfiltration Scan)"]:::guard
        
        SecEngine --> AgentExec["5. Agent Reasoning & Synthesis<br/>(Grounded Fact Verification)"]:::agent
        
        AgentExec --> ToolGuard{"Tool Dispatch<br/>Requested?"}:::guard
        ToolGuard -->|"Yes"| ToolVal["Tool Authorization Matrix<br/>(Least-Privilege Interceptor)"]:::guard
        ToolVal -->|"Safe Tool"| AgentExec
        ToolVal -.->|"Destructive (drop_db)"| BlockDecision
        ToolGuard -->|"No / Complete"| OutputGuard["6. Output Guardrail<br/>(Secret & Credential Redaction)"]:::guard

        OutputGuard --> Scorer["7. Explainable Reliability Scorer<br/>(0–100 Weighted Rating)"]:::decision
    end

    subgraph TelemetryStore ["Observability, Security & Evaluation Subsystems"]
        Tracer["⚡ High-Res Latency Tracer<br/>(process.hrtime p50/p95 Spans)"]:::telemetry
        SecEvents["🚨 Security Event Stream<br/>(SOC Threat Radar & Forensic Logs)"]:::telemetry
        EvalEngine["📊 Continuous Evaluation Engine<br/>(Scorecards & Grounding Citations)"]:::telemetry
        InMemoryStore[("💾 Thread-Safe In-Memory Datastore<br/>(Zero Disk I/O Bottleneck)")]:::telemetry
    end

    Pipeline -.->|"Record Spans"| Tracer
    Pipeline -.->|"Record Threats"| SecEvents
    Pipeline -.->|"Record Run"| EvalEngine
    Tracer --> InMemoryStore
    SecEvents --> InMemoryStore
    EvalEngine --> InMemoryStore

    Scorer --> FinalDecision{"Decision Policy"}:::decision
    FinalDecision -->|"ALLOW"| UserResp["✅ Grounded Response to User<br/>+ Verifiable Citations"]:::decision
    FinalDecision -->|"WARN"| WarnResp["⚠️ Response with Advisory Warnings<br/>(Conflicting Knowledge Flagged)"]:::decision
    FinalDecision -->|"BLOCK"| BlockResp["🛑 Incident Logged + Safe Recovery"]:::guard
```

---

## Component Descriptions

| Subsystem | Function | Latency Target |
|---|---|---|
| **AgentShield Gateway** | HTTP runtime proxy receiving client requests and dispatching to internal verification pipeline. | $< 0.5\text{ms}$ |
| **Input Guardrail** | Scans queries for jailbreaks (`DAN`, developer mode override) and direct instruction overrides. | $< 1.0\text{ms}$ |
| **Moss Retrieval** | In-process vector index (@moss-dev/moss) querying enterprise knowledge bases. | $< 5.0\text{ms}$ |
| **Context Validator** | Validates source provenance, calculates topical relevance, and flags cross-source contradictions. | $< 2.0\text{ms}$ |
| **Security Engine** | Protects against indirect prompt injection embedded in external retrieved text. | $< 1.0\text{ms}$ |
| **Tool Guardrail** | Intercepts destructive system tools (`drop_database`, `delete_table`, `exec_system_cmd`). | $< 1.5\text{ms}$ |
| **Output Guardrail** | Scans model response for leaked secrets (OpenAI keys, database credentials, system prompts). | $< 1.0\text{ms}$ |
| **Reliability Scorer** | Deterministic 7-signal formula producing explainable 0–100 confidence score. | $< 0.5\text{ms}$ |
| **Latency Tracer** | Nanosecond-precision performance counter tracking p50/p95 percentiles across all pipeline spans. | $< 0.2\text{ms}$ |
