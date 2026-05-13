"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Link from "next/link";
import { useAgentContext } from "@/lib/agent-context";

interface SellFormProps {
  shares: number;
  currentPrice: number;
  ticker: string;
}

export default function SellForm({ shares, currentPrice, ticker }: SellFormProps) {
  const [qty, setQty] = useState("");
  const router = useRouter();
  const { markSellFlowEntry } = useAgentContext();
  useEffect(() => { markSellFlowEntry(false); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const parsed = parseInt(qty, 10);
  const valid = !isNaN(parsed) && parsed > 0 && parsed <= shares;
  const proceeds = valid ? parsed * currentPrice : null;

  const error = qty !== "" && !valid
    ? parsed > shares
      ? `You only hold ${shares} shares`
      : "Enter a valid number of shares"
    : null;

  function handleContinue() {
    if (!valid) return;
    router.push(`/holding/canadian-equity-etf/sell/review?qty=${parsed}`);
  }

  return (
    <div style={{ padding: "32px 20px 0", flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Quantity input */}
      <div style={{ marginBottom: 24 }}>
        <label
          htmlFor="qty"
          style={{
            display: "block",
            fontFamily: "var(--font-geist), system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 400,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#908B83",
            marginBottom: 8,
          }}
        >
          Number of shares
        </label>
        <input
          id="qty"
          type="number"
          min="1"
          max={shares}
          step="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="0"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 12,
            border: error ? "1.5px solid #B83535" : "1.5px solid #E2DED9",
            backgroundColor: "#FFFFFF",
            fontFamily: "var(--font-geist), system-ui, sans-serif",
            fontSize: 20,
            fontWeight: 500,
            color: "#1E1A16",
            outline: "none",
            appearance: "textfield",
          }}
        />
        {error && (
          <p style={{ fontFamily: "var(--font-geist), system-ui, sans-serif", fontSize: 13, color: "#B83535", marginTop: 6 }}>
            {error}
          </p>
        )}
      </div>

      {/* Live proceeds calculation */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 16,
          minHeight: 72,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-geist), system-ui, sans-serif", fontSize: 14, color: "#908B83" }}>
            Estimated proceeds
          </span>
          <span
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 22,
              fontWeight: 700,
              color: proceeds !== null ? "#1E1A16" : "#C5BFBA",
              letterSpacing: "-0.02em",
            }}
          >
            {proceeds !== null
              ? `$${proceeds.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`
              : "—"}
          </span>
        </div>
        {valid && (
          <p style={{ fontFamily: "var(--font-geist), system-ui, sans-serif", fontSize: 12, color: "#908B83", marginTop: 4 }}>
            {parsed} shares × ${currentPrice.toFixed(2)}
          </p>
        )}
      </div>

      {/* Settlement note */}
      <p style={{ fontFamily: "var(--font-geist), system-ui, sans-serif", fontSize: 13, color: "#908B83", lineHeight: 1.5, marginBottom: 32 }}>
        Settles in 2 business days · no commission fee
      </p>

      {/* Actions */}
      <div style={{ marginTop: "auto", paddingBottom: 40, display: "flex", flexDirection: "column", gap: 12 }}>
        <Button
          variant="primary"
          fullWidth
          onClick={handleContinue}
          disabled={!valid}
          style={{ opacity: valid ? 1 : 0.4, cursor: valid ? "pointer" : "not-allowed" }}
        >
          Continue to review
        </Button>
        <Link href="/holding/canadian-equity-etf" style={{ textDecoration: "none", textAlign: "center" }}>
          <Button variant="ghost" fullWidth>
            Cancel
          </Button>
        </Link>
      </div>
    </div>
  );
}
