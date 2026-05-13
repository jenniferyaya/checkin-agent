import Link from "next/link";
import { DEMO_PORTFOLIO } from "@/lib/demo-data";

interface CompletePageProps {
  searchParams: Promise<{ qty?: string }>;
}

export default async function SaleCompletePage({ searchParams }: CompletePageProps) {
  const params = await searchParams;
  const holding = DEMO_PORTFOLIO.holdings[0];

  const qty = Math.max(1, parseInt(params.qty ?? "1", 10) || 1);
  const proceeds = qty * holding.currentPrice;

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#EDECEA",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        maxWidth: 430,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      {/* Status icon */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          backgroundColor: "#1E1A16",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12.5l5 5 9-9" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1
        style={{
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontSize: 28,
          fontWeight: 700,
          color: "#1E1A16",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          marginBottom: 12,
        }}
      >
        Your sale is being processed
      </h1>

      <p
        style={{
          fontFamily: "var(--font-geist), system-ui, sans-serif",
          fontSize: 15,
          color: "#908B83",
          lineHeight: 1.5,
          maxWidth: 300,
          marginBottom: 8,
        }}
      >
        {qty} {qty === 1 ? "share" : "shares"} of {holding.ticker} ·{" "}
        ${proceeds.toLocaleString("en-CA", { minimumFractionDigits: 2 })} estimated proceeds
      </p>

      <p
        style={{
          fontFamily: "var(--font-geist), system-ui, sans-serif",
          fontSize: 13,
          color: "#908B83",
          marginBottom: 48,
        }}
      >
        Funds settle in 2 business days.
      </p>

      <Link
        href="/"
        style={{
          fontFamily: "var(--font-geist), system-ui, sans-serif",
          fontSize: 15,
          fontWeight: 500,
          color: "#1E1A16",
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        Back to portfolio
      </Link>
    </div>
  );
}
