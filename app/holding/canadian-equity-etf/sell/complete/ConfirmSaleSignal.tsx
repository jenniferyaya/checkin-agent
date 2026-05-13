"use client";

import { useEffect } from "react";
import { useAgentContext } from "@/lib/agent-context";

export default function ConfirmSaleSignal() {
  const { confirmSale } = useAgentContext();
  useEffect(() => { confirmSale(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
