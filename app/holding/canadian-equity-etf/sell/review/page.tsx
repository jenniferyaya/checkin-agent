import Link from "next/link";
import BackLink from "@/components/BackLink";
import Button from "@/components/Button";
import { DEMO_PORTFOLIO } from "@/lib/demo-data";

interface ReviewPageProps {
  searchParams: Promise<{ qty?: string }>;
}

export default async function SellReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams;
  const holding = DEMO_PORTFOLIO.holdings[0];

  const qty = Math.max(1, Math.min(parseInt(params.qty ?? "1", 10) || 1, holding.shares));
  const proceeds = qty * holding.currentPrice;

  // Calculate locked-in loss from cost basis — never hard-coded
  const costForQty = qty * holding.costBasis;
  const lossLockedIn = costForQty - proceeds; // positive = loss

  const fmt = (n: number) =>
    n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

      {/* Loss callout — the most important copy in the flow */}
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
    </div>
  );
}
