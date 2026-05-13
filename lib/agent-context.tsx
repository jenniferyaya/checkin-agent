"use client";

// lib/agent-context.tsx
//
// React context wrapping the agent state machine.
// All signal updates go through dispatch → reducer → evaluateState().
// The context is mounted in app/layout.tsx so every route shares state.

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import {
  evaluateState,
  deriveGatingContext,
  type AgentState,
  type Signals,
  type StateEvaluation,
  THRESHOLDS,
} from "./agent-state";
import { DEMO_PORTFOLIO } from "./demo-data";

// Gating is derived from demo data once — it won't change mid-session.
const GATING = deriveGatingContext({
  dayChangePct: DEMO_PORTFOLIO.dayChangePct,
  marketDayChangePct: DEMO_PORTFOLIO.marketDayChangePct,
});

// ─── State shape ──────────────────────────────────────────────────────────

const ZERO_SIGNALS: Signals = {
  dwellSeconds: 0,
  portfolioRevisitCount: 0,
  sellFlowAbortCount: 0,
  isOnSellReview: false,
};

interface ContextState {
  signals: Signals;
  evaluation: StateEvaluation;
  // Internal flags for abort detection — not exposed to consumers directly.
  sellFlowActive: boolean;
  saleConfirmed: boolean;
  hasVisitedPortfolio: boolean; // gates revisit counting (first visit doesn't count)
  dismissalsThisSession: number;
  lastBranch: string | null;
}

function makeInitialState(): ContextState {
  return {
    signals: ZERO_SIGNALS,
    evaluation: evaluateState(GATING, ZERO_SIGNALS),
    sellFlowActive: false,
    saleConfirmed: false,
    hasVisitedPortfolio: false,
    dismissalsThisSession: 0,
    lastBranch: null,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────

type Action =
  | { type: "INCREMENT_DWELL" }
  | { type: "MARK_PORTFOLIO_VISIT" }
  | { type: "MARK_SELL_FLOW_ENTRY"; isReview: boolean }
  | { type: "CONFIRM_SALE" }
  | { type: "CHECK_SELL_FLOW_ABORT" }  // called when arriving at any non-sell route
  | { type: "INCREMENT_DISMISSAL" }
  | { type: "SET_LAST_BRANCH"; branch: string }
  | { type: "RESET" };

function reeval(state: ContextState, signals: Partial<Signals>): ContextState {
  const next = { ...state.signals, ...signals };
  return { ...state, signals: next, evaluation: evaluateState(GATING, next) };
}

function reducer(state: ContextState, action: Action): ContextState {
  switch (action.type) {

    case "INCREMENT_DWELL":
      return reeval(state, { dwellSeconds: state.signals.dwellSeconds + 1 });

    case "MARK_PORTFOLIO_VISIT": {
      if (!state.hasVisitedPortfolio) {
        // First visit — mark it but don't count as a revisit.
        return { ...state, hasVisitedPortfolio: true };
      }
      return reeval(state, {
        portfolioRevisitCount: state.signals.portfolioRevisitCount + 1,
      });
    }

    case "MARK_SELL_FLOW_ENTRY":
      return {
        ...reeval(state, { isOnSellReview: action.isReview }),
        sellFlowActive: true,
        saleConfirmed: false,
      };

    case "CONFIRM_SALE":
      // Sale completed — not an abort. Clear sell-flow flags and isOnSellReview.
      return {
        ...reeval(state, { isOnSellReview: false }),
        sellFlowActive: false,
        saleConfirmed: true,
      };

    case "CHECK_SELL_FLOW_ABORT": {
      // Called when the user arrives at a non-sell route (portfolio or holding).
      // Abort detection: "arrival-based" rather than "unmount-based".
      //
      // WHY NOT UNMOUNT: In Next.js App Router, the sell-draft page unmounts
      // when the user navigates to sell-review — which would false-positive as
      // an abort. Detecting abort at the destination (non-sell page arrival)
      // avoids that entirely. Draft→review never reaches a non-sell page,
      // so it never triggers this check.
      const wasInFlow = state.sellFlowActive && !state.saleConfirmed;
      if (!wasInFlow) {
        // Not in a sell flow, or sale was confirmed — just clear review flag.
        return reeval(state, { isOnSellReview: false });
      }
      return {
        ...reeval(state, {
          isOnSellReview: false,
          sellFlowAbortCount: state.signals.sellFlowAbortCount + 1,
        }),
        sellFlowActive: false,
        saleConfirmed: false,
      };
    }

    case "INCREMENT_DISMISSAL":
      return { ...state, dismissalsThisSession: state.dismissalsThisSession + 1 };

    case "SET_LAST_BRANCH":
      return { ...state, lastBranch: action.branch };

    case "RESET":
      return makeInitialState();

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────

interface AgentContextValue {
  // What consumers read
  agentState: AgentState;
  triggerConfidence: number;
  signals: Signals;
  gating: typeof GATING;
  thresholds: typeof THRESHOLDS;
  dismissalsThisSession: number;
  lastBranch: string | null;
  // What screens call
  incrementDwell: () => void;
  markPortfolioVisit: () => void;
  markSellFlowEntry: (isReview: boolean) => void;
  confirmSale: () => void;
  checkSellFlowAbort: () => void;
  incrementDismissal: () => void;
  setLastBranch: (branch: string) => void;
  reset: () => void;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);

  const incrementDwell    = useCallback(() => dispatch({ type: "INCREMENT_DWELL" }), []);
  const markPortfolioVisit = useCallback(() => dispatch({ type: "MARK_PORTFOLIO_VISIT" }), []);
  const markSellFlowEntry = useCallback((isReview: boolean) =>
    dispatch({ type: "MARK_SELL_FLOW_ENTRY", isReview }), []);
  const confirmSale       = useCallback(() => dispatch({ type: "CONFIRM_SALE" }), []);
  const checkSellFlowAbort = useCallback(() => dispatch({ type: "CHECK_SELL_FLOW_ABORT" }), []);
  const incrementDismissal = useCallback(() => dispatch({ type: "INCREMENT_DISMISSAL" }), []);
  const setLastBranch     = useCallback((branch: string) =>
    dispatch({ type: "SET_LAST_BRANCH", branch }), []);
  const reset             = useCallback(() => dispatch({ type: "RESET" }), []);

  return (
    <AgentContext.Provider value={{
      agentState: state.evaluation.state,
      triggerConfidence: state.evaluation.triggerConfidence,
      signals: state.signals,
      gating: GATING,
      thresholds: THRESHOLDS,
      dismissalsThisSession: state.dismissalsThisSession,
      lastBranch: state.lastBranch,
      incrementDwell,
      markPortfolioVisit,
      markSellFlowEntry,
      confirmSale,
      checkSellFlowAbort,
      incrementDismissal,
      setLastBranch,
      reset,
    }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgentContext(): AgentContextValue {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgentContext must be used within AgentProvider");
  return ctx;
}
