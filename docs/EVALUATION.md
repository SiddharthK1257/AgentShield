# AgentShield — Continuous Evaluation & Reliability Methodology

> **Tagline:** "Trust every AI decision before it reaches the user."  
> **Topic:** Evaluation Methodology, Scoring Metrics, and Verification Benchmarks

---

## 1. Overview of Continuous Agent Evaluation

Traditional evaluation frameworks run offline against synthetic datasets or batches of logged traces hours after agent runs complete. In contrast, **AgentShield executes continuous runtime evaluation**: every single cycle through the gateway is evaluated immediately across 7 distinct dimensions before the response is delivered to the user.

---

## 2. The 7 Evaluated Dimensions

```
                    +------------------------------------+
                    |    Aggregate Reliability Score     |
                    |              (0 - 100)             |
                    +------------------------------------+
                                      |
       +------------------------------+------------------------------+
       |             |           |          |           |            |
       v             v           v          v           v            v
  Relevance        Trust      Coverage   Compliance  Security   Confidence &
    (20%)          (20%)       (15%)       (15%)       (15%)    Latency (15%)
```

### 1. Context Relevance ($W = 0.20$)
- Measures semantic similarity and topical coverage between the user query and the retrieved knowledge chunks.
- Evaluated via keyword recall, bigram n-gram phrase matches, and cosine vector alignment.
- **Contradiction Deduction:** When two retrieved knowledge sources assert mutually conflicting statements (e.g. 30-day refund policy vs non-refundable legacy memo), a $-30$ point penalty is assessed.

### 2. Source Provenance & Trust ($W = 0.20$)
- Evaluates the authenticity and authority rating of knowledge bases:
  - Official Cryptographic Legal Policies: `98–100`
  - Internal Security Standards: `99`
  - IAM Permission Matrices: `96`
  - Zendesk Support Knowledge Base: `95`
  - Deprecated / Unverified Legacy Memos: `35`
- Low-trust sources ($< 40$) trigger `WARN` or `FLAGGED` status.

### 3. Evidence Coverage & Grounding ($W = 0.15$)
- Determines whether the generated answer is directly substantiated by retrieved citations.
- Lexical overlap and substring extraction verify that factual assertions are supported by source passages.
- Missing or unsupported claims produce lower evidence coverage scores ($20–40\%$).

### 4. Policy Compliance ($W = 0.15$)
- Verifies that the agent interaction adheres to all active guardrail rules.
- Violations trigger an immediate $0/100$ score for this dimension.

### 5. Inverted Security Risk ($W = 0.15$)
- Quantifies absence of adversarial triggers:
  $$\text{Security Score} = \max(0, 100 - \text{Risk Score})$$
- Prompt injection triggers risk $\ge 94$, yielding a security score $\le 6$.
- When a `BLOCK` decision is rendered, a hard gate penalty caps the overall reliability score at $\le 25$.

### 6. Response Confidence ($W = 0.10$)
- Reflects model internal consistency, lexical certainty, and absence of hedging or conflicting assertions.

### 7. Latency Budget Score ($W = 0.05$)
- Benchmarked against the zero-latency target ($< 10\text{ms}$):
  - $\le 15\text{ms}$: $100$ points
  - $\le 50\text{ms}$: $96$ points
  - $\le 150\text{ms}$: $88$ points
  - $\le 500\text{ms}$: $75$ points
  - $> 1000\text{ms}$: $< 40$ points

---

## 3. Reliability Grades & Action Thresholds

| Overall Score | Grade | Status | Action Taken |
|---|---|---|---|
| **90 – 100** | `EXCELLENT` | `PASSED` | `ALLOW` — Fast-track delivery to user with grounding citations. |
| **75 – 89** | `GOOD` | `PASSED` | `ALLOW` — Delivered to user with high confidence. |
| **60 – 74** | `FAIR` | `FLAGGED` | `WARN` — Advisory warnings appended regarding conflicting context or low trust. |
| **40 – 59** | `POOR` | `FAILED` | `REVIEW` — Held for human-in-the-loop review. |
| **0 – 39** | `CRITICAL` | `FAILED` | `BLOCK` — Intercepted; safe recovery alternative generated. |

---

## 4. Evaluation Run Records

Every request produces a permanent audit record accessible via `GET /api/evaluations`:
- `id`: Unique evaluation identifier (e.g. `EVAL-104`).
- `runId`: Associated execution ID.
- `traceId`: Associated telemetry trace.
- `score`: Composite reliability score (`0–100`).
- `passed`: Boolean threshold ($\ge 70$ and not blocked).
- `input`: Evaluated prompt.
- `response`: Generated or remediated output.
- `decision`: Decision classification.
- `detectedIssues`: List of safety or grounding issues detected.
- `evidenceCoveragePercent`: Grounded claim percentage.
- `hallucinationRisk`: Risk estimation ($0–100$).
- `latencyMs`: Total measured duration.
- `breakdown`: Full 7-signal score mapping.
