// lib/agent-state.ts
//
// Pure state evaluator for the check-in agent.
// No React, no side effects. Takes signals + gating context, returns state + confidence.
// Designed to be tested as a plain function before wiring into React context.

export type AgentState = "dormant" | "attentive" | "ready" | "engaged";

// ─── Types ────────────────────────────────────────────────────────────────

export interface GatingContext {
  portfolioDown: boolean;  // dayChangePct < 0
  marketDown: boolean;     // marketDayChangePct < -2 (material drop, not noise)
}

export interface Signals {
  dwellSeconds: number;           // cumulative time on portfolio screen this session
  portfolioRevisitCount: number;  // navigations back to portfolio (first visit excluded)
  sellFlowAbortCount: number;     // entered sell draft/review, then left without confirming
  isOnSellReview: boolean;        // currently on the review/confirm step
}

export interface StateEvaluation {
  state: AgentState;
  triggerConfidence: number;      // 0–100, for the debug panel bar
}

// ─── Thresholds ───────────────────────────────────────────────────────────
// Demo-compressed: real production values would be calibrated against telemetry.
// Case study note: "compressed for live presentation; production thresholds
// would be 3+ minutes dwell and 3+ app opens per hour."

export const THRESHOLDS = {
  dwellSeconds: 30,         // 30s demo vs ~3 min production
  portfolioRevisits: 3,     // same in demo and production
  sellFlowAborts: 1,        // 1 abort is enough — it's a primary signal
} as const;

// ─── Evaluator ────────────────────────────────────────────────────────────

export function evaluateState(
  gating: GatingContext,
  signals: Signals,
): StateEvaluation {

  // ── Layer 1: Gating ──────────────────────────────────────────────────
  // Both conditions must hold for the agent to leave dormant.
  // In our demo data both are always true, but the gate is evaluated, not assumed.
  if (!gating.portfolioDown || !gating.marketDown) {
    return { state: "dormant", triggerConfidence: 0 };
  }

  // ── Layer 2: Signal evaluation ───────────────────────────────────────
  //
  // Asymmetric stacking — this asymmetry is the design:
  //
  //   PRIMARY:   aborted sell flow (the user took an action and reversed it)
  //   SECONDARY: dwell + revisit checking (passive anxiety proxies)
  //
  // Primary alone fires the threshold.
  // Secondary signals must BOTH stack — either one alone is just noise.
  // This treats hesitation (primary) as qualitatively stronger than anxiety (secondary).

  const primaryFired =
    signals.sellFlowAbortCount >= THRESHOLDS.sellFlowAborts;

  const dwellFired =
    signals.dwellSeconds >= THRESHOLDS.dwellSeconds;

  const revisitFired =
    signals.portfolioRevisitCount >= THRESHOLDS.portfolioRevisits;

  // Both secondaries must stack; neither alone reaches threshold.
  const secondaryStackFired = dwellFired && revisitFired;

  const thresholdReached = primaryFired || secondaryStackFired;

  // ── Layer 3: State derivation ─────────────────────────────────────────

  // Engaged: threshold was reached AND user is now on the review step.
  // "Was reached" = still reached, because signals never decrement in this model.
  if (thresholdReached && signals.isOnSellReview) {
    return { state: "engaged", triggerConfidence: 100 };
  }

  if (thresholdReached) {
    // Ready: threshold crossed, not yet on the review step.
    // Confidence 70–95 depending on which combination fired.
    let confidence = 70;
    if (primaryFired)   confidence += 15; // primary is a stronger signal
    if (dwellFired)     confidence += 5;
    if (revisitFired)   confidence += 5;
    return { state: "ready", triggerConfidence: Math.min(confidence, 95) };
  }

  // Attentive: gating met, signals accumulating, threshold not yet crossed.
  // Confidence 10–30 proportional to signal progress.
  const dwellProgress  = Math.min(signals.dwellSeconds / THRESHOLDS.dwellSeconds, 1);
  const revisitProgress = Math.min(signals.portfolioRevisitCount / THRESHOLDS.portfolioRevisits, 1);
  const confidence = Math.round(10 + dwellProgress * 10 + revisitProgress * 10);
  return { state: "attentive", triggerConfidence: Math.min(confidence, 30) };
}

// ─── Helpers ──────────────────────────────────────────────────────────────

export function deriveGatingContext(portfolio: {
  dayChangePct: number;
  marketDayChangePct: number;
}): GatingContext {
  return {
    portfolioDown: portfolio.dayChangePct < 0,
    marketDown: portfolio.marketDayChangePct < -2,
  };
}
