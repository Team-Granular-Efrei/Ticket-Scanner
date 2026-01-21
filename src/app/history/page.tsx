import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";
import type { ReceiptData } from "@/lib/schema";
import { cn } from "@/utils/tw";

// Helper to fetch data directly on the server
async function getReceipts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipts`, {
      cache: "no-store", // Ensure we always get fresh data
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    // Sort by newest first
    return data.reverse();
  } catch (_e) {
    return [];
  }
}

export default async function HistoryPage() {
  const receipts: (ReceiptData & { id: string | number; savedAt?: string })[] = await getReceipts();

  // Calculate Stats
  const totalSpent = receipts.reduce((acc, r) => acc + r.total_spent, 0);

  return (
    <main className="mx-auto min-h-screen max-w-md bg-base-100 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 py-6">
        <Link href="/" className="btn btn-circle btn-ghost btn-sm">
          <LuArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="font-black text-2xl tracking-tighter">Your Wallet</h1>
      </div>

      {/* Dashboard Card */}
      <div className="card mb-8 w-full bg-primary text-primary-content shadow-xl">
        <div className="card-body p-6">
          <div>
            <p className="font-medium text-primary-content/80 text-sm uppercase tracking-wider">Total Spend</p>
            <h2 className="mt-1 font-black text-4xl">${totalSpent.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <h3 className="mb-4 pl-1 font-bold text-base-content/50 text-xs uppercase tracking-widest">Recent Activity</h3>

      <div className="space-y-3">
        {receipts.length === 0 ? (
          <div className="py-10 text-center opacity-50">
            <p>No receipts yet.</p>
            <Link href="/" className="btn btn-link btn-sm">
              Scan your first one
            </Link>
          </div>
        ) : (
          receipts.map((receipt) => {
            const dateSource = receipt.date ?? receipt.savedAt;
            const dateValue = dateSource ? new Date(dateSource) : null;

            return (
              <Link key={receipt.id} href={`/history/${receipt.id}`} className="block">
                <div className="card w-full border border-base-200 bg-base-100 shadow-sm transition-colors hover:border-primary/50">
                  <div className="card-body flex-row items-center justify-between gap-4 p-4">
                    {/* Date Box */}
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-base-200">
                      <span className="font-bold text-[10px] text-base-content/40 uppercase">
                        {dateValue ? dateValue.toLocaleDateString("en-US", { month: "short" }) : "--"}
                      </span>
                      <span className="font-black text-lg leading-none">{dateValue ? dateValue.getDate() : "--"}</span>
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-bold text-base-content">{receipt.merchant?.name}</h4>
                      <p className="flex items-center gap-1 truncate text-base-content/60 text-xs">
                        <span className="badge badge-xs badge-ghost">{receipt.merchant?.type}</span>
                        <span>• {receipt.items?.length || 0} items</span>
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className="font-black text-base-content">${receipt.total_spent?.toFixed(2)}</p>
                      <p className={cn("font-bold text-[10px]", (receipt.analysis?.health_score || 0) > 70 ? "text-success" : "text-warning")}>
                        {receipt.analysis?.health_score || 0} score
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}
