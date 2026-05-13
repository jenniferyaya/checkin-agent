"use client";

import { useEffect } from "react";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import TickerIcon from "@/components/TickerIcon";
import ChangeDisplay from "@/components/ChangeDisplay";
import Button from "@/components/Button";
import { DEMO_PORTFOLIO } from "@/lib/demo-data";
import { useAgentContext } from "@/lib/agent-context";
import AmbientBanner from "@/components/AmbientBanner";

export default function HoldingDetailPage() {
  const { checkSellFlowAbort } = useAgentContext();
  useEffect(() => { checkSellFlowAbort(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const holding = DEMO_PORTFOLIO.holdings[0];
  const totalCost = holding.costBasis * holding.shares;

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#EDECEA", display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto" }}>
      {/* Top nav */}
      <header style={{ padding: "20px 20px 0" }}>
        <BackLink href="/" label="Portfolio" />
      </header>

      {/* Holding identity */}
      <section style={{ padding: "28px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <TickerIcon ticker={holding.ticker} bgColor="#2B4A3A" size="md" />
          <div>
            <p
              style={{
                fontFamily: "var(--font-geist), system-ui, sans-serif",
                fontSize: 11,
                fontWeight: 400,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#908B83",
                marginBottom: 3,
              }}
            >
              {holding.ticker}
            </p>
            <h1
              style={{
                fontFamily: "var(--font-geist), system-ui, sans-serif",
                fontSize: 18,
                fontWeight: 600,
                color: "#1E1A16",
              }}
            >
              {holding.name}
            </h1>
          </div>
        </div>

        {/* Current value — large Fraunces display */}
        <div style={{ marginBottom: 8 }}>
          <p
            style={{
              fontFamily: "var(--font-geist), system-ui, sans-serif",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#908B83",
              marginBottom: 6,
            }}
          >
            Current value
          </p>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            {(() => {
              const [whole, cents] = holding.currentValue
                .toLocaleString("en-CA", { minimumFractionDigits: 2 })
                .split(".");
              return (
                <>
                  <span
                    style={{
                      fontFamily: "var(--font-fraunces), Georgia, serif",
                      fontSize: 44,
                      fontWeight: 900,
                      color: "#1E1A16",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    ${whole}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-fraunces), Georgia, serif",
                      fontSize: 28,
                      fontWeight: 900,
                      color: "#1E1A16",
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    .{cents}
                  </span>
                </>
              );
            })()}
          </div>
        </div>

        {/* Day / week change */}
        <div style={{ display: "flex", gap: 20, marginTop: 4 }}>
          <div>
            <p style={{ fontFamily: "var(--font-geist), system-ui, sans-serif", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#908B83", marginBottom: 3 }}>Today</p>
            <ChangeDisplay pct={holding.dayChangePct} showArrow={true} size="md" />
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-geist), system-ui, sans-serif", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#908B83", marginBottom: 3 }}>This week</p>
            <ChangeDisplay pct={holding.weekChangePct} showArrow={true} size="md" />
          </div>
        </div>
        <AmbientBanner />
      </section>

      {/* Stats row */}
      <section style={{ padding: "24px 20px 0" }}>
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: "16px 20px" }}>
          {[
            { label: "Shares held", value: `${holding.shares}` },
            { label: "Price per share", value: `$${holding.currentPrice.toFixed(2)}` },
            { label: "Cost basis", value: `$${totalCost.toLocaleString("en-CA", { minimumFractionDigits: 2 })}` },
            { label: "Cost per share", value: `$${holding.costBasis.toFixed(2)}` },
          ].map((row, i, arr) => (
            <div key={row.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                }}
              >
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

      {/* About */}
      <section style={{ padding: "24px 20px 0" }}>
        <h2
          style={{
            fontFamily: "var(--font-geist), system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#908B83",
            marginBottom: 10,
          }}
        >
          About
        </h2>
        <p
          style={{
            fontFamily: "var(--font-geist), system-ui, sans-serif",
            fontSize: 14,
            lineHeight: 1.6,
            color: "#1E1A16",
          }}
        >
          {holding.about}
        </p>
      </section>

      {/* Sell CTA */}
      <div style={{ padding: "32px 20px 40px", marginTop: "auto" }}>
        <Link href="/holding/canadian-equity-etf/sell" style={{ textDecoration: "none", display: "block" }}>
          <Button variant="primary" fullWidth>
            Sell {holding.ticker}
          </Button>
        </Link>
      </div>
    </div>
  );
}
