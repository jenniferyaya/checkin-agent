// lib/decision-log.ts
//
// Decision log type, localStorage persistence helpers, and in-memory fallback.
// Used by AgentProvider (read/write) and the /decisions page (read).

export type Branch = "substantive" | "emotional" | "dismissive" | "hardship";

export type DecisionLogEntry = {
  id: string;
  timestamp: number;
  triggerReason: {
    sellFlowAborts: number;
    dwellSeconds: number;
    portfolioRevisits: number;
    summary: string;          // e.g. "Aborted sell flow + 45s dwell"
  };
  userReason: string;         // what the user typed or selected as a chip
  agentBranch: Branch;
  agentMessage: string;       // the full text Claude returned, verbatim
  agentReasoning?: string;    // Claude's reasoning field, for the debug surface
  userChoice: "proceeded" | "paused" | "dismissed";
  showHardshipResource: boolean;
  portfolioSnapshot: {
    dayChangePct: number;
    weekChangePct: number;
    holdingValue: number;
    dollarLossLockedIn: number;
  };
};

// ─── localStorage helpers ────────────────────────────────────────────────

const STORAGE_KEY = "checkInAgent.decisionLog";

// Module-level fallback — survives across React re-renders if localStorage fails.
let _useMemory = false;
let _memoryLog: DecisionLogEntry[] = [];

export function loadDecisions(): DecisionLogEntry[] {
  if (typeof window === "undefined") return []; // SSR guard
  if (_useMemory) return [..._memoryLog];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DecisionLogEntry[]) : [];
  } catch {
    console.warn("[check-in] localStorage unavailable — using in-memory fallback for decision log");
    _useMemory = true;
    return [..._memoryLog];
  }
}

export function saveDecisions(entries: DecisionLogEntry[]): void {
  if (typeof window === "undefined") return;
  if (_useMemory) { _memoryLog = [...entries]; return; }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    console.warn("[check-in] localStorage write failed — falling back to in-memory log");
    _useMemory = true;
    _memoryLog = [...entries];
  }
}

export function clearDecisionsStorage(): void {
  if (typeof window === "undefined") return;
  _memoryLog = [];
  if (_useMemory) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — memory is already cleared above
  }
}

// ─── Trigger summary ─────────────────────────────────────────────────────

export function makeTriggerSummary(signals: {
  sellFlowAbortCount: number;
  dwellSeconds: number;
  portfolioRevisitCount: number;
}): string {
  const parts: string[] = [];
  if (signals.sellFlowAbortCount >= 1) parts.push("Aborted sell flow");
  if (signals.dwellSeconds >= 30) parts.push(`${signals.dwellSeconds}s dwell`);
  if (signals.portfolioRevisitCount >= 3) parts.push(`${signals.portfolioRevisitCount} revisits`);
  return parts.join(" + ") || "Signal threshold reached";
}
