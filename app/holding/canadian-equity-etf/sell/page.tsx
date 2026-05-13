import BackLink from "@/components/BackLink";
import SellForm from "./SellForm";
import { DEMO_PORTFOLIO } from "@/lib/demo-data";

export default function SellDraftPage() {
  const holding = DEMO_PORTFOLIO.holdings[0];
  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#EDECEA", display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto" }}>
      <header style={{ padding: "20px 20px 0" }}>
        <BackLink href="/holding/canadian-equity-etf" label="Cancel" />
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
          Sell {holding.name}
        </h1>
        <p style={{ fontFamily: "var(--font-geist), system-ui, sans-serif", fontSize: 14, color: "#908B83" }}>
          {holding.shares} shares available · ${holding.currentPrice.toFixed(2)} per share
        </p>
      </section>

      <SellForm
        shares={holding.shares}
        currentPrice={holding.currentPrice}
        ticker={holding.ticker}
      />
    </div>
  );
}
