"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import Button from "@/components/Button";
import { DEMO_PORTFOLIO } from "@/lib/demo-data";
import { useAgentContext } from "@/lib/agent-context";

function EngagedModal({ qty, onDismiss }: { qty: number; onDismiss: () => void }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        backgroundColor: "rgba(30, 26, 22, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        zIndex: 1000,
        padding: "0 0 0",
      }}
    >
      <div
        style={{
          backgroundColor: "#EDECEA",
          borderRadius: "20px 20px 0 0",
          padding: "28px 24px 48px",
          width: "100%",
          maxWidth: 430,
        }}
      >
        <div
          style={{
            width: 36, height: 4, borderRadius: 2,
            backgroundColor: "#C5BFBA",
            margin: "0 auto 28px",
          }}
        />
        <h2
          style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#1E1A16",
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
            marginBottom: 12,
          }}
        >
          Before you confirm —
        </h2>
        <p
          style={{
            fontFamily: "var(--font-geist), system-ui, sans-serif",
            fontSize: 14,
            color: "#908B83",
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          You've started and paused this sale a few times today. Would you like a moment to think through your decision before locking in this loss?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              console.log("[agent] engaged modal: continue to confirm");
              onDismiss();
            }}
          >
            Continue to confirm
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              console.log("[agent] engaged modal: dismissed");
              onDismiss();
            }}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}

function SellReviewContent() {
  const searchParams = useSearchParams();
  const holding = DEMO_PORTFOLIO.holdings[0];
  const { agentState, markSellFlowEntry } = useAgentContext();
  const [modalDismissed, setModalDismissed] = useState(false);

  const qty = Math.max(1, Math.min(parseInt(searchParams.get("qty") ?? "1", 10) || 1, holding.shares));
  const proceeds = qty * holding.currentPrice;
  const costForQty = qty * holding.costBasis;
  const lossLockedIn = costForQty - proceeds;

  const fmt = (n: number) =>
    n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  useEffect(() => {
    markSellFlowEntry(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showModal = agentState === "engaged" && !modalDismissed;

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#EDECEA", display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto" }}>
      <header style={{ padding: "20px 20px 0" }}>
        <BackLink href={`/holding/canadian-equity-etf/sell`} label="Edit" />
      </header>

      <section style={{ padding: "28px 20px 0" }}>
        <h1
          style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#1E1A16",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            marginBottom: 4,
          }}
        >
          Review your sale
        </h1>
        <p style={{ fontFamily: "var(--font-geist), system-ui, sans-serif", fontSize: 14, color: "#908B83" }}>
          Confirm the details below before proceeding.
        </p>
      </section>

      {/* Summary card */}
      <section style={{ padding: "28px 20px 0" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: "0 20px" }}>
          {[
            { label: "Holding", value: holding.name },
            { label: "Ticker", value: holding.ticker },
            { label: "Shares to sell", value: `${qty}` },
            { label: "Price per share", value: `$${holding.currentPrice.toFixed(2)}` },
            { label: "Estimated proceeds", value: `$${fmt(proceeds)}` },
          ].map((row, i, arr) => (
            <div key={row.label}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
                <span style={{ fontFamily: "var(--font-geist), system-ui, sans-serif", fontSize: 14, color: "#908B83" }}>
                  {row.label}
                </span>
                <span style={{ fontFamily: "var(--font-geist), system-ui, sans-serif", fontSize: 14, fontWeight: 500, color: "#1E1A16" }}>
                  {row.value}
                </span>
              </div>
              {i < arr.length - 1 && <hr style={{ border: "none", borderTop: "1px solid #E2DED9" }} />}
            </div>
          ))}
        </div>
      </section>

      {/* Loss callout */}
      <section style={{ padding: "16px 20px 0" }}>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: "16px 20px",
            border: "1.5px solid #B83535",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-geist), system-ui, sans-serif",
              fontSize: 14,
              color: "#1E1A16",
              lineHeight: 1.5,
            }}
          >
            {lossLockedIn > 0 ? (
              <>
                Selling now locks in a{" "}
                <span style={{ color: "#B83535", fontWeight: 600 }}>
                  ${fmt(lossLockedIn)} loss
                </span>{" "}
                on this position. Your cost was ${fmt(costForQty)} for {qty} shares; you'd receive ${fmt(proceeds)}.
              </>
            ) : (
              <>
                Selling now realizes a{" "}
                <span style={{ color: "#1E7A4A", fontWeight: 600 }}>
                  ${fmt(Math.abs(lossLockedIn))} gain
                </span>{" "}
                on this position.
              </>
            )}
          </p>
        </div>
      </section>

      {/* Settlement note */}
      <p style={{ padding: "12px 20px 0", fontFamily: "var(--font-geist), system-ui, sans-serif", fontSize: 13, color: "#908B83" }}>
        Settlement in 2 business days. No commission fee.
      </p>

      {/* Actions */}
      <div style={{ padding: "32px 20px 40px", marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <Link
          href={`/holding/canadian-equity-etf/sell/complete?qty=${qty}`}
          style={{ textDecoration: "none", display: "block" }}
        >
          <Button variant="primary" fullWidth>
            Confirm sale
          </Button>
        </Link>
        <Link href="/holding/canadian-equity-etf/sell" style={{ textDecoration: "none" }}>
          <Button variant="ghost" fullWidth>
            Back
          </Button>
        </Link>
      </div>

      {showModal && <EngagedModal qty={qty} onDismiss={() => setModalDismissed(true)} />}
    </div>
  );
}

export default function SellReviewPage() {
  return (
    <Suspense>
      <SellReviewContent />
    </Suspense>
  );
}
