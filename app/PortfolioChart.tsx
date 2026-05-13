"use client";

// Simulated 1-week declining chart — matches the mockup's downward arc.
// Static data points; no real market feed.

const RAW = [100, 98, 99, 97, 95, 92, 89, 88, 85, 83, 80, 77, 75, 72, 70, 68];

export default function PortfolioChart() {
  const W = 430;
  const H = 120;
  const PAD_X = 0;
  const PAD_Y = 10;

  const min = Math.min(...RAW);
  const max = Math.max(...RAW);
  const range = max - min || 1;

  const pts = RAW.map((v, i) => ({
    x: PAD_X + (i / (RAW.length - 1)) * (W - PAD_X * 2),
    y: PAD_Y + ((max - v) / range) * (H - PAD_Y * 2),
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: H, display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B83535" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#B83535" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Reference line (dotted) at starting value */}
      <line
        x1={pts[0].x}
        y1={pts[0].y}
        x2={W}
        y2={pts[0].y}
        stroke="#C5BFBA"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <path d={areaPath} fill="url(#chartGrad)" />
      <path d={linePath} fill="none" stroke="#B83535" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
