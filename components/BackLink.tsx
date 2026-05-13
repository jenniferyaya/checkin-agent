// Back chevron link for inner screens — no bottom nav, full-page layout.

import Link from "next/link";

interface BackLinkProps {
  href: string;
  label?: string;
}

export default function BackLink({ href, label = "Back" }: BackLinkProps) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: "#1E1A16",
        fontFamily: "var(--font-geist), system-ui, sans-serif",
        fontSize: 15,
        fontWeight: 400,
        textDecoration: "none",
        opacity: 0.8,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M11 13.5L6.5 9 11 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </Link>
  );
}
