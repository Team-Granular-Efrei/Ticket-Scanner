import Link from "next/link";
import { LuChevronLeft, LuSettings } from "react-icons/lu";
import { ReceiptEditor } from "@/components/receipt-editor";
import { ReceiptSchema } from "@/lib/schema";

// Helper to fetch data directly on the server
async function getReceipt(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipts?id=${id}`, {
      cache: "no-store", // Ensure we always get fresh data
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    // Sort by newest first
    return data[0];
  } catch (_e) {
    return null;
  }
}

const emptyReceipt = ReceiptSchema.parse({
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

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = await getReceipt(id);

  if (!receipt && id !== "new") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <h2 className="font-bold text-2xl">Receipt not found</h2>
        <p className="mt-2 text-center text-base-content/60">The receipt you are looking for does not exist or has been deleted.</p>
      </main>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-20 bg-base-100">
        <nav className="flex h-(--header-height) items-center justify-between p-2">
          <Link href="/" className="btn btn-ghost btn-circle btn-sm">
            <LuChevronLeft className="icon size-6" />
          </Link>
          <span className="font-semibold">Wallet</span>
          <button type="button" className="btn btn-ghost btn-circle btn-sm" popoverTarget="my-drawer-6" popoverTargetAction="show">
            <LuSettings className="icon size-6" />
          </button>
        </nav>
      </header>
      <ReceiptEditor initialData={receipt ?? emptyReceipt} isUpdate={!!receipt} />
    </>
  );
}
