export const DEMO_PORTFOLIO = {
  totalValue: 18420.50,
  dayChangeDollar: -1217.30,
  dayChangePct: -6.2,
  weekChangePct: -8.7,
  marketDayChangePct: -3.1,
  marketIndex: "TSX",
  holdings: [
    {
      id: "canadian-equity-etf",
      name: "Canadian Equity ETF",
      ticker: "XIC",
      shares: 200,
      currentPrice: 24.10,
      currentValue: 4820.00,
      costBasis: 25.30,        // per share; total cost was $5,060
      dollarLossIfSoldNow: 240.00, // (25.30 - 24.10) * 200
      dayChangePct: -6.4,
      weekChangePct: -9.1,
      about: "A diversified Canadian equity index fund tracking the S&P/TSX Capped Composite Index. It holds over 200 Canadian companies across all major sectors.",
    },
  ],
} as const;

export const DEMO_USER = {
  firstName: "Alex",
  investorTenure: "first-time",
  goal: "first home in ~5 years",
};
