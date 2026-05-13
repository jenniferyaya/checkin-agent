"use client";

import { useAgentContext } from "@/lib/agent-context";

export default function AmbientIndicator() {
  const { agentState } = useAgentContext();

  if (agentState !== "ready" && agentState !== "engaged") return null;

  return (
    <>
      <style>{`
        @keyframes ambient-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#B83535",
          marginLeft: 8,
          verticalAlign: "middle",
          animation: "ambient-pulse 2s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
    </>
  );
}
