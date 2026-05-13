// Quick state-machine evaluator test — no test framework, just console output.
// Run with: npx tsx scripts/test-state.ts

import { evaluateState, deriveGatingContext, type GatingContext, type Signals } from "../lib/agent-state";

const GATING_MET: GatingContext = { portfolioDown: true, marketDown: true };
const GATING_NOT_MET: GatingContext = { portfolioDown: false, marketDown: true };
const ZERO_SIGNALS: Signals = {
  dwellSeconds: 0,
  portfolioRevisitCount: 0,
  sellFlowAbortCount: 0,
  isOnSellReview: false,
};

const scenarios: Array<{ label: string; gating: GatingContext; signals: Signals; expect: string }> = [
  {
    label: "1. Gating not met → dormant",
    gating: GATING_NOT_MET,
    signals: ZERO_SIGNALS,
    expect: "dormant",
  },
  {
    label: "2. Gating met, no signals → attentive",
    gating: GATING_MET,
    signals: ZERO_SIGNALS,
    expect: "attentive",
  },
  {
    label: "3. ASYMMETRY — dwell only at threshold → attentive (not ready)",
    gating: GATING_MET,
    signals: { ...ZERO_SIGNALS, dwellSeconds: 30 },
    expect: "attentive",
  },
  {
    label: "4. ASYMMETRY — revisits only at threshold → attentive (not ready)",
    gating: GATING_MET,
    signals: { ...ZERO_SIGNALS, portfolioRevisitCount: 3 },
    expect: "attentive",
  },
  {
    label: "5. Both secondaries stacked → ready",
    gating: GATING_MET,
    signals: { ...ZERO_SIGNALS, dwellSeconds: 30, portfolioRevisitCount: 3 },
    expect: "ready",
  },
  {
    label: "6. PRIMARY — one abort alone → ready (asymmetry validated)",
    gating: GATING_MET,
    signals: { ...ZERO_SIGNALS, sellFlowAbortCount: 1 },
    expect: "ready",
  },
  {
    label: "7. Abort + on review → engaged",
    gating: GATING_MET,
    signals: { ...ZERO_SIGNALS, sellFlowAbortCount: 1, isOnSellReview: true },
    expect: "engaged",
  },
  {
    label: "8. Both secondaries + on review → engaged",
    gating: GATING_MET,
    signals: { ...ZERO_SIGNALS, dwellSeconds: 30, portfolioRevisitCount: 3, isOnSellReview: true },
    expect: "engaged",
  },
  {
    label: "9. On review but threshold not reached → attentive (no engagement yet)",
    gating: GATING_MET,
    signals: { ...ZERO_SIGNALS, dwellSeconds: 15, portfolioRevisitCount: 1, isOnSellReview: true },
    expect: "attentive",
  },
  {
    label: "10. deriveGatingContext() from demo data values",
    gating: deriveGatingContext({ dayChangePct: -6.2, marketDayChangePct: -3.1 }),
    signals: ZERO_SIGNALS,
    expect: "attentive",
  },
];

let passed = 0;
let failed = 0;

console.log("\n── Agent state evaluator tests ──\n");

for (const s of scenarios) {
  const result = evaluateState(s.gating, s.signals);
  const ok = result.state === s.expect;
  const symbol = ok ? "✓" : "✗";
  const status = ok ? "" : `  ← EXPECTED "${s.expect}"`;
  console.log(`${symbol}  ${s.label}`);
  console.log(`   state: ${result.state.padEnd(10)} confidence: ${result.triggerConfidence}${status}`);
  if (ok) passed++; else failed++;
}

console.log(`\n── ${passed}/${scenarios.length} passed ${failed > 0 ? `(${failed} FAILED)` : "✓"} ──\n`);
if (failed > 0) process.exit(1);
