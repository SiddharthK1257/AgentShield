'use client';

import React, { useState, useEffect } from 'react';
import {
  AgentRunRequest,
  AgentRunResponse,
  ContextChunk,
  EvaluationRecord,
  GuardrailPolicy,
  PipelineDecision,
  SecurityEvent,
  SystemMetrics,
  TraceRecord,
} from '@/lib/types';
import { Navbar, TabType } from '@/components/Navbar';
import { JudgeDemoBar, DemoScenario, DEMO_SCENARIOS } from '@/components/JudgeDemoBar';
import { JudgeModeView } from '@/components/JudgeModeView';
import { ReliabilityModal } from '@/components/ReliabilityModal';

import { OverviewTab } from '@/components/tabs/OverviewTab';
import { LiveAgentTab } from '@/components/tabs/LiveAgentTab';
import { SecurityTab } from '@/components/tabs/SecurityTab';
import { ContextTab } from '@/components/tabs/ContextTab';
import { EvaluationsTab } from '@/components/tabs/EvaluationsTab';
import { TracesTab } from '@/components/tabs/TracesTab';
import { EvidenceTab } from '@/components/tabs/EvidenceTab';
import { PoliciesTab } from '@/components/tabs/PoliciesTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';

export default function AgentShieldDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isJudgeMode, setIsJudgeMode] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | undefined>(undefined);

  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalRequests: 4,
    threatsBlocked: 2,
    contextsEvaluated: 16,
    averageMossRetrievalMs: 1.25,
    averageAgentLatencyMs: 7.85,
    evaluationPassRatePercent: 75,
    reliabilityAverage: 92,
    p50LatencyMs: 5.9,
    p95LatencyMs: 12.8,
    activePoliciesCount: 7,
  });

  const [traces, setTraces] = useState<TraceRecord[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [policies, setPolicies] = useState<GuardrailPolicy[]>([]);
  const [lastResult, setLastResult] = useState<AgentRunResponse | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isReliabilityModalOpen, setIsReliabilityModalOpen] = useState(false);

  // Fetch initial data from APIs
  const refreshData = async () => {
    try {
      const [mRes, tRes, sRes, eRes, pRes] = await Promise.all([
        fetch('/api/metrics').then((r) => r.json()).catch(() => null),
        fetch('/api/traces').then((r) => r.json()).catch(() => null),
        fetch('/api/security/events').then((r) => r.json()).catch(() => null),
        fetch('/api/evaluations').then((r) => r.json()).catch(() => null),
        fetch('/api/policies').then((r) => r.json()).catch(() => null),
      ]);

      if (mRes && !mRes.error) setMetrics(mRes);
      if (tRes && tRes.traces) setTraces(tRes.traces);
      if (sRes && sRes.events) setSecurityEvents(sRes.events);
      if (eRes && eRes.evaluations) setEvaluations(eRes.evaluations);
      if (pRes && pRes.policies) setPolicies(pRes.policies);
    } catch (err) {
      console.error('Failed to fetch initial dashboard data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Run Agent pipeline via API
  const handleRunAgent = async (request: AgentRunRequest): Promise<AgentRunResponse> => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data: AgentRunResponse = await res.json();
      setLastResult(data);
      await refreshData();
      return data;
    } catch (err) {
      console.error('Error running agent:', err);
      throw err;
    } finally {
      setIsRunning(false);
    }
  };

  // Run Benchmark Scenario directly
  const handleSelectScenario = async (scenario: DemoScenario) => {
    setActiveScenarioId(scenario.id);
    const req: AgentRunRequest = {
      prompt: scenario.prompt,
      scenarioId: scenario.id,
      injectedContext: scenario.injectedContext,
      requestedTool: scenario.requestedTool,
    };

    const res = await handleRunAgent(req);
    // If user was on a tab that isn't judge mode, switch to live-agent or stay
    if (!isJudgeMode && activeTab === 'overview') {
      setActiveTab('live-agent');
    }
  };

  // Policy handlers
  const handleTogglePolicy = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch('/api/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled }),
      });
      if (res.ok) {
        setPolicies((prev) =>
          prev.map((p) => (p.id === id ? { ...p, enabled } : p))
        );
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeAction = async (id: string, action: PipelineDecision) => {
    try {
      const res = await fetch('/api/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        setPolicies((prev) =>
          prev.map((p) => (p.id === id ? { ...p, action } : p))
        );
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePolicy = async (policy: Partial<GuardrailPolicy>) => {
    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      if (res.ok) {
        const created = await res.json();
        setPolicies((prev) => [...prev, created]);
        refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Context search handler
  const handleSearchRetrieval = async (query: string): Promise<{ chunks: ContextChunk[]; latencyMs: number }> => {
    const res = await fetch('/api/retrieval/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    return {
      chunks: data.chunks || [],
      latencyMs: data.latencyMs || 0.8,
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-100">
      
      {/* Top Navbar with Judge Mode Switch & Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setIsJudgeMode(false);
          setActiveTab(tab);
        }}
        isJudgeMode={isJudgeMode}
        onToggleJudgeMode={() => setIsJudgeMode(!isJudgeMode)}
        totalThreatsBlocked={metrics.threatsBlocked}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Judge Benchmark Quick-Launch Bar (Always accessible for judging) */}
        <JudgeDemoBar
          onSelectScenario={handleSelectScenario}
          activeScenarioId={activeScenarioId}
          isRunning={isRunning}
        />

        {/* Content View: Executive Judge Mode vs In-Depth SOC Tabs */}
        {isJudgeMode ? (
          <JudgeModeView
            lastResult={lastResult}
            isRunning={isRunning}
            onRunSafe={() => handleSelectScenario(DEMO_SCENARIOS[0])}
            onRunAttack={() => handleSelectScenario(DEMO_SCENARIOS[1])}
            onOpenReliabilityModal={() => setIsReliabilityModalOpen(true)}
          />
        ) : (
          <div>
            {activeTab === 'overview' && (
              <OverviewTab
                metrics={metrics}
                recentTraces={traces}
                recentEvents={securityEvents}
                onOpenReliabilityModal={() => setIsReliabilityModalOpen(true)}
                onSelectTrace={(t) => {
                  setActiveTab('traces');
                }}
                onNavigateToLiveAgent={() => setActiveTab('live-agent')}
                onNavigateToSecurity={() => setActiveTab('security')}
                onNavigateToContext={() => setActiveTab('context')}
                onNavigateToTraces={() => setActiveTab('traces')}
              />
            )}

            {activeTab === 'live-agent' && (
              <LiveAgentTab
                onRunAgent={handleRunAgent}
                isRunning={isRunning}
                lastResponse={lastResult}
                onOpenReliabilityModal={() => setIsReliabilityModalOpen(true)}
              />
            )}

            {activeTab === 'security' && (
              <SecurityTab events={securityEvents} />
            )}

            {activeTab === 'context' && (
              <ContextTab onSearchRetrieval={handleSearchRetrieval} />
            )}

            {activeTab === 'evaluations' && (
              <EvaluationsTab evaluations={evaluations} />
            )}

            {activeTab === 'traces' && (
              <TracesTab
                traces={traces}
                p50LatencyMs={metrics.p50LatencyMs}
                p95LatencyMs={metrics.p95LatencyMs}
              />
            )}

            {activeTab === 'evidence' && (
              <EvidenceTab />
            )}

            {activeTab === 'policies' && (
              <PoliciesTab
                policies={policies}
                onTogglePolicy={handleTogglePolicy}
                onChangeAction={handleChangeAction}
                onCreatePolicy={handleCreatePolicy}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab />
            )}
          </div>
        )}
      </main>

      {/* Mathematical Reliability Score Breakdown Modal */}
      <ReliabilityModal
        isOpen={isReliabilityModalOpen}
        onClose={() => setIsReliabilityModalOpen(false)}
        reliability={lastResult?.reliability || {
          overall: metrics.reliabilityAverage,
          grade: metrics.reliabilityAverage >= 90 ? 'EXCELLENT' : 'GOOD',
          passed: metrics.reliabilityAverage >= 70,
          breakdown: {
            contextRelevance: 96,
            sourceTrust: 98,
            evidenceCoverage: 91,
            policyCompliance: 100,
            security: 98,
            responseConfidence: 94,
            latency: 100,
          },
          explanation: [
            'Context Relevance: 96/100 (Weight: 20%) — Ground-truth vector alignment.',
            'Source Trust: 98/100 (Weight: 20%) — Verified domain authority.',
            'Evidence Coverage: 91/100 (Weight: 15%) — Factual grounding citation overlap.',
            'Policy Compliance: 100/100 (Weight: 15%) — Guardrail rule adherence.',
            'Security Score: 98/100 (Weight: 15%) — Zero active threats detected.',
            'Response Confidence: 94/100 (Weight: 10%) — Lexical certainty.',
            'Latency Factor: 100/100 (Weight: 5%) — Sub-10ms target met.',
          ],
        }}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-border/60 py-4 text-center text-xs font-mono text-slate-500">
        AgentShield • YC Fall 2026 x Moss Zero-Latency Sprint • "Trust every AI decision before it reaches the user."
      </footer>

    </div>
  );
}
