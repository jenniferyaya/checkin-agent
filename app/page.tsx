"use client";

import { useEffect } from "react";
import Link from "next/link";
import TickerIcon from "@/components/TickerIcon";
import ChangeDisplay from "@/components/ChangeDisplay";
import { DEMO_PORTFOLIO, DEMO_USER } from "@/lib/demo-data";
import PortfolioChart from "./PortfolioChart";
import { useAgentContext } from "@/lib/agent-context";
import AmbientIndicator from "@/components/AmbientIndicator";
import AmbientBanner from "@/components/AmbientBanner";

const TICKER_COLORS: Record<string, string> = {
  XIC:  "#2B4A3A",
  XEQT: "#2B4A3A",
  ZAG:  "#2A3554",
};

function PortfolioIcon({ active }: { active?: boolean }) {
  const c = active ? "#1E1A16" : "#908B83";
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 16.5L8.5 10l3.5 4L16 8.5l3 3.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ActivityIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="7.5" stroke="#908B83" strokeWidth="1.5" />
      <path d="M11 7.5V11l2.5 2" stroke="#908B83" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function MarketsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="6" height="16" rx="1.5" stroke="#908B83" strokeWidth="1.5" />
      <rect x="13" y="8" width="6" height="11" rx="1.5" stroke="#908B83" strokeWidth="1.5" />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="8" r="3.5" stroke="#908B83" strokeWidth="1.5" />
      <path d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7" stroke="#908B83" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function PortfolioPage() {
  const p = DEMO_PORTFOLIO;
  const holding = p.holdings[0];
  const { incrementDwell, markPortfolioVisit, checkSellFlowAbort } = useAgentContext();

  useEffect(() => {
    checkSellFlowAbort();
    markPortfolioVisit();
    const timer = setInterval(incrementDwell, 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalFormatted = p.totalValue.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [totalWhole, totalCents] = totalFormatted.split(".");

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#EDECEA", display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto" }}>
      {/* Header */}
      <header style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontStyle: "italic",
                fontSize: 26,
                fontWeight: 400,
                color: "#1E1A16",
                letterSpacing: "-0.02em",
              }}
            >
              folio
            </span>
            <AmbientIndicator />
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              href="/decisions"
              style={{
                fontFamily: "var(--font-geist), system-ui, sans-serif",
                fontSize: 13,
                color: "#908B83",
                textDecoration: "none",
              }}
            >
              History
            </Link>
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                backgroundColor: "#1E1A16",
                color: "#FFFFFF",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-geist), system-ui, sans-serif",
                fontSize: 14,
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {DEMO_USER.firstName[0]}
            </span>
          </div>
        </div>
      </header>

      {/* Portfolio total */}
      <section style={{ padding: "28px 20px 0" }}>
        <p
          style={{
            fontFamily: "var(--font-geist), system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 400,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#908B83",
            marginBottom: 6,
          }}
        >
          Total Value CAD
        </p>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 52,
              fontWeight: 900,
              color: "#1E1A16",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            ${totalWhole}
          </span>
          <span
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 32,
              fontWeight: 900,
              color: "#1E1A16",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            .{totalCents}
          </span>
        </div>
        <div style={{ marginTop: 8 }}>
          <ChangeDisplay
            dollar={p.dayChangeDollar}
            pct={p.dayChangePct}
            label="today"
            showArrow={true}
            size="md"
          />
          <AmbientBanner />
        </div>
      </section>

      {/* Market context card */}
      <section style={{ padding: "24px 20px 0" }}>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            padding: "14px 0",
            display: "flex",
          }}
        >
          {[
            { label: "S&P/TSX", value: "-2.84%" },
            { label: "S&P 500", value: "-3.12%" },
            { label: "This week", value: `-${Math.abs(p.weekChangePct).toFixed(2)}%` },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              style={{
                flex: 1,
                textAlign: "center",
                borderRight: i < arr.length - 1 ? "1px solid #E2DED9" : undefined,
                padding: "0 8px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-geist), system-ui, sans-serif",
                  fontSize: 10,
                  fontWeight: 400,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#908B83",
                  marginBottom: 4,
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-geist), system-ui, sans-serif",
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#B83535",
                }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Time period selector */}
      <section style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((period) => {
            const active = period === "1W";
            return (
              <button
                key={period}
                style={{
                  padding: "5px 10px",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: active ? "#1E1A16" : "transparent",
                  color: active ? "#FFFFFF" : "#908B83",
                  fontFamily: "var(--font-geist), system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {period}
              </button>
            );
          })}
        </div>
      </section>

      {/* Chart */}
      <section style={{ padding: "12px 0 0", overflow: "hidden" }}>
        <PortfolioChart />
      </section>

      {/* Holdings */}
      <section style={{ padding: "28px 20px 0", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <h2
            style={{
              fontFamily: "var(--font-geist), system-ui, sans-serif",
              fontSize: 18,
              fontWeight: 600,
              color: "#1E1A16",
            }}
          >
            Holdings
          </h2>
          <span
            style={{
              fontFamily: "var(--font-geist), system-ui, sans-serif",
              fontSize: 13,
              color: "#908B83",
            }}
          >
            {p.holdings.length} positions
          </span>
        </div>

        <div>
          {p.holdings.map((h, i) => {
            const rowContent = (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 0",
                }}
              >
                <TickerIcon ticker={h.ticker} bgColor={TICKER_COLORS[h.ticker] ?? "#2B4A3A"} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-geist), system-ui, sans-serif",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#1E1A16",
                      marginBottom: 2,
                    }}
                  >
                    {h.ticker}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-geist), system-ui, sans-serif",
                      fontSize: 13,
                      color: "#908B83",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.name}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-geist), system-ui, sans-serif",
                      fontSize: 15,
                      fontWeight: 500,
                      color: "#1E1A16",
                      marginBottom: 2,
                    }}
                  >
                    ${h.currentValue.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                  </p>
                  <ChangeDisplay pct={h.dayChangePct} showArrow={false} size="sm" />
                </div>
              </div>
            );

            return (
              <div key={h.ticker}>
                {h.id ? (
                  <Link href={`/holding/${h.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                    {rowContent}
                  </Link>
                ) : (
                  rowContent
                )}
                {i < p.holdings.length - 1 && (
                  <hr style={{ border: "none", borderTop: "1px solid #E2DED9" }} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom nav */}
      <nav
        style={{
          borderTop: "1px solid #E2DED9",
          backgroundColor: "#EDECEA",
          display: "flex",
          padding: "12px 0 28px",
          marginTop: "auto",
        }}
      >
        {[
          { label: "Portfolio", icon: <PortfolioIcon active />, active: true },
          { label: "Activity", icon: <ActivityIcon /> },
          { label: "Markets", icon: <MarketsIcon /> },
          { label: "Profile", icon: <ProfileIcon /> },
        ].map((item) => (
          <button
            key={item.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {item.icon}
            <span
              style={{
                fontFamily: "var(--font-geist), system-ui, sans-serif",
                fontSize: 11,
                fontWeight: item.active ? 600 : 400,
                color: item.active ? "#1E1A16" : "#908B83",
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
