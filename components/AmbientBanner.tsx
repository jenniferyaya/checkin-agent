"use client";

import { useAgentContext } from "@/lib/agent-context";

// The second ambient surface in Option C.
// Appears below the day-change figure when the agent is ready or engaged.
// No animation — the dot near the wordmark carries motion; this carries meaning.

export default function AmbientBanner() {
  const { agentState } = useAgentContext();

  if (agentState !== "ready" && agentState !== "engaged") return null;

  return (
    <p
      style={{
        fontFamily: "var(--font-geist), system-ui, sans-serif",
        fontSize: 13,
        color: "#908B83",
        marginTop: 10,
        lineHeight: 1.4,
      }}
    >
      Sharp drops are hard to sit with.
    </p>
  );
}
