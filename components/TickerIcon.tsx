// Colored square icon showing the holding's ticker letter(s)

interface TickerIconProps {
  ticker: string;
  bgColor?: string;
  size?: "sm" | "md";
}

const DEFAULT_BG = "#2B4A3A";

export default function TickerIcon({ ticker, bgColor = DEFAULT_BG, size = "md" }: TickerIconProps) {
  const dim = size === "md" ? 44 : 36;
  const fontSize = size === "md" ? 14 : 12;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: dim,
        height: dim,
        borderRadius: 8,
        backgroundColor: bgColor,
        color: "#FFFFFF",
        fontFamily: "var(--font-geist), system-ui, sans-serif",
        fontSize,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        flexShrink: 0,
      }}
    >
      {ticker.slice(0, 3)}
    </span>
  );
}
