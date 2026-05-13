// Design system buttons — three variants matching the mockup vocabulary.
// primary:   dark fill pill (sell flow CTAs)
// outline:   bordered pill, transparent fill ("Let's talk" style)
// ghost:     no border, no fill, muted text ("Continue selling" style)

import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  fullWidth?: boolean;
}

const base: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  fontFamily: "var(--font-geist), system-ui, sans-serif",
  fontSize: 16,
  fontWeight: 500,
  lineHeight: 1,
  padding: "14px 28px",
  cursor: "pointer",
  border: "none",
  transition: "opacity 0.15s ease",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const variants: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: "#1E1A16",
    color: "#FFFFFF",
    border: "none",
  },
  outline: {
    backgroundColor: "transparent",
    color: "#1E1A16",
    border: "1.5px solid #1E1A16",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "#908B83",
    border: "none",
    padding: "14px 16px",
  },
};

export default function Button({
  variant = "primary",
  fullWidth = false,
  style,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      style={{
        ...base,
        ...variants[variant],
        width: fullWidth ? "100%" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
