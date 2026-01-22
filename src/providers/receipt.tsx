"use client";

import { type ReactNode, useState } from "react";
import type { ReceiptData } from "@/lib/schema";
import { createContext } from "@/utils/create-context";

interface ReceiptContextType {
  draft: ReceiptData | null;
  setDraft: (data: ReceiptData | null) => void;
}

const [ReceiptContextProvider, useReceipt] = createContext<ReceiptContextType>();

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<ReceiptData | null>(null);

  return <ReceiptContextProvider value={{ draft, setDraft }}>{children}</ReceiptContextProvider>;
}

export { useReceipt };
