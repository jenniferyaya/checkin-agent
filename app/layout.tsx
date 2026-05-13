import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Fraunces } from "next/font/google";
import "./globals.css";
import { AgentProvider } from "@/lib/agent-context";
import DebugPanel from "@/components/DebugPanel";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "folio",
  description: "Your investment portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable} antialiased`}>
      <body>
        <AgentProvider>
          {children}
          <DebugPanel />
        </AgentProvider>
      </body>
    </html>
  );
}
