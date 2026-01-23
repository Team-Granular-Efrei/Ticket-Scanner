"use client";

import { ReceiptSchema } from "@/lib/schema";
import { useReceipt } from "@/providers/receipt";

async function draftData() {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay

  return ReceiptSchema.parse({
    currency: "USD",
    date: new Date().toISOString().split("T")[0],
    discount: 0,
    items: [{ name: "", price: 0, quantity: 1, category: "Other" }],
    tax_amount: 0,
    time: new Date().toISOString().split("T")[1].split(".")[0],
    total_spent: 0,
    service_charge: 0,
    merchant: {
      address: "",
      name: "",
      type: "",
    },
    analysis: {
      insight: "",
    },
  });
}

export default function NewReceiptButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const setDraft = useReceipt((ctx) => ctx?.setDraft);

  const handleClick = async () => {
    const emptyReceipt = await draftData();
    setDraft(emptyReceipt);
  };

  return (
    <button type="button" className="link-overlay cursor-pointer" popoverTarget="my-drawer-3" popoverTargetAction="show" onClick={handleClick} {...props} />
  );
}
