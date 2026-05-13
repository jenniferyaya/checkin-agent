// Shows a dollar/percentage change. Loss values render in text-loss red.

interface ChangeDisplayProps {
  dollar?: number;
  pct: number;
  label?: string;        // e.g. "today"
  showArrow?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ChangeDisplay({
  dollar,
  pct,
  label,
  showArrow = true,
  size = "md",
}: ChangeDisplayProps) {
  const isLoss = pct < 0;
  const color = isLoss ? "#B83535" : "#1E7A4A";

  const fontSizes: Record<string, string> = {
    sm: "13px",
    md: "14px",
    lg: "16px",
  };
  const fontSize = fontSizes[size];

  const absDollar = dollar !== undefined ? Math.abs(dollar) : undefined;
  const absPct = Math.abs(pct);

  return (
    <span style={{ color, fontSize, fontWeight: 400, display: "inline-flex", alignItems: "center", gap: 4 }}>
      {showArrow && (
        <span style={{ fontSize: "10px" }}>{isLoss ? "▼" : "▲"}</span>
      )}
      {absDollar !== undefined && (
        <span>${absDollar.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      )}
      {absDollar !== undefined && <span>({absPct.toFixed(2)}%)</span>}
      {absDollar === undefined && <span>{isLoss ? "-" : "+"}{absPct.toFixed(2)}%</span>}
      {label && <span style={{ color: "#908B83", marginLeft: 2 }}>{label}</span>}
    </span>
  );
}
