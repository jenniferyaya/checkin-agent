"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAgentContext } from "@/lib/agent-context";
import type { DecisionLogEntry, Branch } from "@/lib/decision-log";

// ─── Helpers ──────────────────────────────────────────────────────────────

function timeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 30) return "just now";
  if (diffSec < 60) return `${diffSec} seconds ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
}

function absoluteTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const BRANCH_LABELS: Record<Branch, string> = {
  substantive: "substantive",
  emotional:   "emotional",
  dismissive:  "dismissive",
  hardship:    "hardship",
};

const CHOICE_LABELS: Record<DecisionLogEntry["userChoice"], string> = {
  proceeded: "You proceeded with the sale",
  paused:    "You paused",
  dismissed: "You dismissed the check-in",
};

// ─── Entry card ───────────────────────────────────────────────────────────

function EntryCard({ entry }: { entry: DecisionLogEntry }) {
  const [now, setNow] = useState(Date.now());

  // Keep relative timestamps live for the first few minutes
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  void now; // used implicitly via timeAgo re-render

  const fmt = (n: number) =>
    n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: "20px 20px",
        marginBottom: 12,
      }}
    >
      {/* Timestamp + trigger */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <span
            title={absoluteTime(entry.timestamp)}
            style={{
              fontFamily: "var(--font-geist), system-ui, sans-serif",
              fontSize: 12,
              color: "#908B83",
              cursor: "default",
            }}
          >
            {timeAgo(entry.timestamp)}
          </span>
          <p
            style={{
              fontFamily: "var(--font-geist), system-ui, sans-serif",
              fontSize: 12,
              color: "#C5BFBA",
              marginTop: 2,
            }}
          >
            {entry.triggerReason.summary}
          </p>
        </div>
        {/* Branch label — monospace, muted, only on this transparency surface */}
        <span
          style={{
            fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
            fontSize: 10,
            color: "#908B83",
            backgroundColor: "#F5F2EF",
            padding: "3px 7px",
            borderRadius: 4,
            letterSpacing: "0.04em",
            flexShrink: 0,
            marginLeft: 12,
          }}
        >
          {BRANCH_LABELS[entry.agentBranch]}
        </span>
      </div>

      {/* User's stated reason */}
      <p
        style={{
          fontFamily: "var(--font-geist), system-ui, sans-serif",
          fontSize: 13,
          color: "#908B83",
          fontStyle: "italic",
          marginBottom: 12,
          lineHeight: 1.5,
        }}
      >
        You said: {entry.userReason}
      </p>

      {/* Agent's message */}
      <div
        style={{
          borderLeft: "2px solid #E2DED9",
          paddingLeft: 12,
          marginBottom: 12,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-geist), system-ui, sans-serif",
            fontSize: 13,
            color: "#1E1A16",
            lineHeight: 1.65,
          }}
        >
          {entry.agentMessage}
        </p>
      </div>

      {/* Hardship resource shown indicator */}
      {entry.showHardshipResource && (
        <p
          style={{
            fontFamily: "var(--font-geist), system-ui, sans-serif",
            fontSize: 11,
            color: "#908B83",
            marginBottom: 8,
            letterSpacing: "0.03em",
          }}
        >
          Credit Counselling Canada resource was shown
        </p>
      )}

      {/* User's choice */}
      <p
        style={{
          fontFamily: "var(--font-geist), system-ui, sans-serif",
          fontSize: 13,
          fontWeight: 500,
          color: entry.userChoice === "proceeded" ? "#1E7A4A" : "#908B83",
        }}
      >
        {CHOICE_LABELS[entry.userChoice]}
      </p>

      {/* Portfolio snapshot — on hover/title for compactness */}
      <p
        style={{
          fontFamily: "var(--font-geist), system-ui, sans-serif",
          fontSize: 11,
          color: "#C5BFBA",
          marginTop: 4,
        }}
      >
        Portfolio was down {Math.abs(entry.portfolioSnapshot.dayChangePct).toFixed(1)}% that day · ${fmt(entry.portfolioSnapshot.dollarLossLockedIn)} locked in
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function DecisionsPage() {
  const { decisions, clearDecisions } = useAgentContext();
  const sorted = [...decisions].reverse(); // most recent first

  function handleClear() {
    if (window.confirm("Clear all check-in history? This can't be undone.")) {
      clearDecisions();
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#EDECEA",
        display: "flex",
        flexDirection: "column",
        maxWidth: 430,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <header style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-geist), system-ui, sans-serif",
              fontSize: 13,
              color: "#908B83",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ← Portfolio
          </Link>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#1E1A16",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            marginTop: 20,
            marginBottom: 4,
          }}
        >
          Decision history
        </h1>
        <p
          style={{
            fontFamily: "var(--font-geist), system-ui, sans-serif",
            fontSize: 14,
            color: "#908B83",
          }}
        >
          {decisions.length === 0
            ? "No check-ins yet this session"
            : `${decisions.length} check-in${decisions.length === 1 ? "" : "s"} across this session`}
        </p>
      </header>

      {/* Entry list or empty state */}
      <section style={{ padding: "24px 20px 0", flex: 1 }}>
        {sorted.length === 0 ? (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: "32px 24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-geist), system-ui, sans-serif",
                fontSize: 14,
                color: "#908B83",
                lineHeight: 1.6,
              }}
            >
              No check-ins yet. The agent only surfaces when its trigger conditions are met.
            </p>
          </div>
        ) : (
          sorted.map((entry) => <EntryCard key={entry.id} entry={entry} />)
        )}
      </section>

      {/* Clear history */}
      {decisions.length > 0 && (
        <div style={{ padding: "24px 20px 40px", textAlign: "center" }}>
          <button
            onClick={handleClear}
            style={{
              background: "none",
              border: "none",
              fontFamily: "var(--font-geist), system-ui, sans-serif",
              fontSize: 13,
              color: "#C5BFBA",
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            Clear history
          </button>
        </div>
      )}
    </div>
  );
}
