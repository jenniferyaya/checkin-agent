"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAgentContext } from "@/lib/agent-context";
import { DEMO_PORTFOLIO, DEMO_USER } from "@/lib/demo-data";

// ─── Types ────────────────────────────────────────────────────────────────

type Phase = "articulation" | "loading" | "response";

interface CheckInResponse {
  branch: string;
  message: string;
  showHardshipResource: boolean;
  reasoning?: string;
}

// ─── Chip data ────────────────────────────────────────────────────────────

const CHIPS = [
  "I need the money",
  "I'm worried about further losses",
  "I'm rebalancing",
  "Something has changed",
  "Something else",
];

// ─── Sub-components ───────────────────────────────────────────────────────

function PulsingDot() {
  return (
    <>
      <style>{`
        @keyframes checkin-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }
      `}</style>
      <span
        style={{
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: "#908B83",
          animation: "checkin-pulse 1.6s ease-in-out infinite",
        }}
      />
    </>
  );
}

function HardshipCard() {
  return (
    <div
      style={{
        backgroundColor: "#F5F1EE",
        border: "1px solid #D4CEC9",
        borderRadius: 10,
        padding: "14px 16px",
        marginTop: 16,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-geist), system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#908B83",
          marginBottom: 6,
        }}
      >
        Resource
      </p>
      <p
        style={{
          fontFamily: "var(--font-geist), system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "#1E1A16",
          marginBottom: 3,
        }}
      >
        Credit Counselling Canada
      </p>
      <p
        style={{
          fontFamily: "var(--font-geist), system-ui, sans-serif",
          fontSize: 13,
          color: "#908B83",
          lineHeight: 1.5,
          marginBottom: 8,
        }}
      >
        Free, confidential financial counselling. Available across Canada.
      </p>
      <p
        style={{
          fontFamily: "var(--font-geist), system-ui, sans-serif",
          fontSize: 13,
          color: "#1E1A16",
          fontWeight: 500,
        }}
      >
        1-866-398-5999
      </p>
      <p
        style={{
          fontFamily: "var(--font-geist), system-ui, sans-serif",
          fontSize: 12,
          color: "#908B83",
          marginTop: 2,
        }}
      >
        creditcounsellingcanada.ca
      </p>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────

interface EngagedModalProps {
  onClose: () => void;
}

export default function EngagedModal({ onClose }: EngagedModalProps) {
  const router = useRouter();
  const { dismissalsThisSession, incrementDismissal, setLastBranch } = useAgentContext();
  const [phase, setPhase] = useState<Phase>("articulation");
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");
  const [response, setResponse] = useState<CheckInResponse | null>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const holding = DEMO_PORTFOLIO.holdings[0];
  const dollarLoss = holding.dollarLossIfSoldNow;

  const fmt = (n: number) =>
    n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  console.log(`[agent] Articulation opened, dismissal count: ${dismissalsThisSession}`);

  async function submitReason(userReason: string) {
    console.log(`[agent] User selected reason: "${userReason}"`);
    setPhase("loading");
    console.log("[agent] Posting to /api/check-in");

    const body = {
      userReason,
      portfolio: {
        holdingName: holding.name,
        currentValue: holding.currentValue,
        dollarLossLockedIn: holding.dollarLossIfSoldNow,
        portfolioDayChangePct: DEMO_PORTFOLIO.dayChangePct,
        portfolioWeekChangePct: DEMO_PORTFOLIO.weekChangePct,
        marketDayChangePct: DEMO_PORTFOLIO.marketDayChangePct,
        userGoal: DEMO_USER.goal,
      },
      priorDismissalsThisSession: dismissalsThisSession,
    };

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data: CheckInResponse = await res.json();
      console.log(`[agent] Response received: branch=${data.branch}, hardship=${data.showHardshipResource}`);
      setLastBranch(data.branch);
      setResponse(data);
      setPhase("response");
    } catch {
      // API failed — fall back to dismissive per the route's contract
      const fallback: CheckInResponse = {
        branch: "dismissive",
        message: "The check-in didn't load. Your sale can proceed as normal — that's your call.",
        showHardshipResource: false,
      };
      console.log("[agent] API call failed, using fallback");
      setLastBranch(fallback.branch);
      setResponse(fallback);
      setPhase("response");
    }
  }

  function handleChipClick(chip: string) {
    if (chip === "Something else") {
      setCustomMode(true);
      setTimeout(() => customInputRef.current?.focus(), 50);
      return;
    }
    submitReason(chip);
  }

  function handleCustomSubmit() {
    const text = customText.trim();
    if (!text) return;
    submitReason(text);
  }

  function handleDismissLink() {
    // "Just let me sell" — routes through Claude as dismissive but counts as dismissal
    incrementDismissal();
    console.log(`[agent] Dismissal incremented to ${dismissalsThisSession + 1}`);
    submitReason("Just let me sell");
  }

  function handleProceedWithSale() {
    // Not a dismissal — user completed the check-in
    console.log("[agent] User selected: Proceed with sale");
    onClose();
  }

  function handlePauseForNow() {
    incrementDismissal();
    console.log(`[agent] User selected: Pause for now`);
    console.log(`[agent] Dismissal incremented to ${dismissalsThisSession + 1}`);
    onClose();
    router.push("/holding/canadian-equity-etf");
  }

  function handleXClose() {
    incrementDismissal();
    console.log(`[agent] Modal closed via X, dismissal incremented to ${dismissalsThisSession + 1}`);
    onClose();
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        backgroundColor: "rgba(30, 26, 22, 0.55)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleXClose(); }}
    >
      <div
        style={{
          backgroundColor: "#EDECEA",
          borderRadius: "20px 20px 0 0",
          padding: "20px 24px 44px",
          width: "100%",
          maxWidth: 430,
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            width: 36, height: 4, borderRadius: 2,
            backgroundColor: "#C5BFBA",
            margin: "0 auto 20px",
          }}
        />

        {/* ── Phase: articulation ── */}
        {phase === "articulation" && (
          <>
            {/* X close + dismiss link row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <button
                onClick={handleDismissLink}
                style={{
                  background: "none", border: "none",
                  fontFamily: "var(--font-geist), system-ui, sans-serif",
                  fontSize: 13, color: "#908B83",
                  cursor: "pointer", padding: 0,
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                Just let me sell
              </button>
              <button
                onClick={handleXClose}
                style={{
                  background: "none", border: "none",
                  color: "#908B83", cursor: "pointer",
                  fontSize: 18, padding: 0, lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Opening line */}
            <p
              style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontSize: 20,
                fontWeight: 700,
                color: "#1E1A16",
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
                marginBottom: 20,
              }}
            >
              Quick check — you're about to lock in a ${fmt(dollarLoss)} loss. What's prompting this?
            </p>

            {/* Chip grid or custom input */}
            {!customMode ? (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    style={{
                      padding: "9px 14px",
                      borderRadius: 999,
                      border: "1.5px solid #C5BFBA",
                      backgroundColor: "#FFFFFF",
                      fontFamily: "var(--font-geist), system-ui, sans-serif",
                      fontSize: 13,
                      fontWeight: 400,
                      color: "#1E1A16",
                      cursor: "pointer",
                      lineHeight: 1.3,
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <input
                  ref={customInputRef}
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCustomSubmit(); }}
                  placeholder="Describe what's going on…"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #C5BFBA",
                    backgroundColor: "#FFFFFF",
                    fontFamily: "var(--font-geist), system-ui, sans-serif",
                    fontSize: 14,
                    color: "#1E1A16",
                    outline: "none",
                    boxSizing: "border-box",
                    marginBottom: 10,
                  }}
                />
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customText.trim()}
                  style={{
                    width: "100%",
                    padding: "12px 0",
                    borderRadius: 10,
                    border: "none",
                    backgroundColor: customText.trim() ? "#1E1A16" : "#C5BFBA",
                    color: "#FFFFFF",
                    fontFamily: "var(--font-geist), system-ui, sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: customText.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  Continue
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Phase: loading ── */}
        {phase === "loading" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "28px 0 20px",
            }}
          >
            <PulsingDot />
            <span
              style={{
                fontFamily: "var(--font-geist), system-ui, sans-serif",
                fontSize: 14,
                color: "#908B83",
              }}
            >
              One moment…
            </span>
          </div>
        )}

        {/* ── Phase: response ── */}
        {phase === "response" && response && (
          <>
            {/* Agent message */}
            <p
              style={{
                fontFamily: "var(--font-geist), system-ui, sans-serif",
                fontSize: 15,
                color: "#1E1A16",
                lineHeight: 1.65,
                marginBottom: 20,
              }}
            >
              {response.message}
            </p>

            {/* Hardship resource card */}
            {response.showHardshipResource && <HardshipCard />}

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: response.showHardshipResource ? 20 : 8,
              }}
            >
              <button
                onClick={handleProceedWithSale}
                style={{
                  padding: "13px 0",
                  borderRadius: 10,
                  border: "1.5px solid #C5BFBA",
                  backgroundColor: "transparent",
                  fontFamily: "var(--font-geist), system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#1E1A16",
                  cursor: "pointer",
                }}
              >
                Proceed with sale
              </button>
              <button
                onClick={handlePauseForNow}
                style={{
                  padding: "13px 0",
                  borderRadius: 10,
                  border: "none",
                  backgroundColor: "transparent",
                  fontFamily: "var(--font-geist), system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  color: "#908B83",
                  cursor: "pointer",
                }}
              >
                Pause for now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
