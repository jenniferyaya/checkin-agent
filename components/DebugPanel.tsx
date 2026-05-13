"use client";

import { useState } from "react";
import { useAgentContext } from "@/lib/agent-context";
import { THRESHOLDS } from "@/lib/agent-state";

const STATE_COLOR: Record<string, string> = {
  dormant:   "#908B83",
  attentive: "#E8A838",
  ready:     "#B83535",
  engaged:   "#2B4A3A",
};

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ color: "#908B83" }}>{label}</span>
        <span style={{ color: "#E2DED9" }}>{value}/{max}</span>
      </div>
      <div style={{ height: 4, backgroundColor: "#2A2520", borderRadius: 2 }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: pct >= 100 ? "#B83535" : "#E8A838",
            borderRadius: 2,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function DebugPanel() {
  const [open, setOpen] = useState(true);
  const { agentState, triggerConfidence, signals, gating, reset } = useAgentContext();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", bottom: 16, left: 16,
          width: 28, height: 28, borderRadius: "50%",
          backgroundColor: STATE_COLOR[agentState],
          border: "none", cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          zIndex: 9999,
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "fixed", bottom: 16, left: 16,
        width: 220,
        backgroundColor: "rgba(18, 15, 12, 0.92)",
        backdropFilter: "blur(8px)",
        borderRadius: 10,
        padding: "12px 14px",
        fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
        fontSize: 11,
        color: "#E2DED9",
        zIndex: 9999,
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 8, height: 8, borderRadius: "50%",
              backgroundColor: STATE_COLOR[agentState],
              boxShadow: `0 0 6px ${STATE_COLOR[agentState]}`,
            }}
          />
          <span style={{ fontWeight: 700, letterSpacing: "0.05em", color: "#FFFFFF" }}>
            {agentState.toUpperCase()}
          </span>
        </div>
        <button
          onClick={() => setOpen(false)}
          style={{ background: "none", border: "none", color: "#908B83", cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {/* Confidence bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
          <span style={{ color: "#908B83" }}>confidence</span>
          <span style={{ color: "#E2DED9" }}>{triggerConfidence}%</span>
        </div>
        <div style={{ height: 4, backgroundColor: "#2A2520", borderRadius: 2 }}>
          <div
            style={{
              height: "100%",
              width: `${triggerConfidence}%`,
              backgroundColor: STATE_COLOR[agentState],
              borderRadius: 2,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Signal bars */}
      <Bar label="dwell" value={signals.dwellSeconds} max={THRESHOLDS.dwellSeconds} />
      <Bar label="revisits" value={signals.portfolioRevisitCount} max={THRESHOLDS.portfolioRevisits} />
      <Bar label="aborts" value={signals.sellFlowAbortCount} max={THRESHOLDS.sellFlowAborts} />

      {/* Booleans */}
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#908B83" }}>portfolio↓</span>
          <span style={{ color: gating.portfolioDown ? "#4CAF7D" : "#B83535" }}>
            {gating.portfolioDown ? "true" : "false"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#908B83" }}>market↓</span>
          <span style={{ color: gating.marketDown ? "#4CAF7D" : "#B83535" }}>
            {gating.marketDown ? "true" : "false"}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#908B83" }}>onReview</span>
          <span style={{ color: signals.isOnSellReview ? "#4CAF7D" : "#908B83" }}>
            {signals.isOnSellReview ? "true" : "false"}
          </span>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={reset}
        style={{
          marginTop: 10,
          width: "100%",
          padding: "5px 0",
          backgroundColor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 5,
          color: "#908B83",
          fontFamily: "inherit",
          fontSize: 11,
          cursor: "pointer",
          letterSpacing: "0.05em",
        }}
      >
        RESET
      </button>
    </div>
  );
}
