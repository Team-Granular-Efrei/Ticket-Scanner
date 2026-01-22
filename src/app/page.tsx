import Link from "next/link";
import { LuSettings } from "react-icons/lu";
import type { ReceiptData } from "@/lib/schema";

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
  const receipts: (ReceiptData & { savedAt: string })[] = await getReceipts();

  // Calculate Stats
  const totalSpent = receipts.reduce((acc, r) => acc + r.total_spent, 0);

  return (
    <>
      <header className="sticky top-0 z-20 bg-base-100">
        <nav className="flex h-(--header-height) items-center justify-between p-2">
          <span className="btn btn-circle btn-sm pointer-events-none opacity-0" />
          <h1 className="text-center font-bold text-lg">My transactions</h1>
          <button type="button" className="btn btn-ghost btn-circle btn-sm" popoverTarget="my-drawer-4" popoverTargetAction="show">
            <LuSettings className="icon size-6" />
          </button>
        </nav>
      </header>

      <main className="mx-auto min-h-[80dvh] max-w-md bg-base-100 p-4 pb-24">
        {/* Dashboard Card */}
        <div className="card mb-8 w-full bg-primary text-primary-content shadow-xl">
          <div className="card-body p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-primary-content/80 text-sm uppercase tracking-wider">Total Spend</p>
                <h2 className="mt-1 font-black text-4xl">${totalSpent.toFixed(2)}</h2>
              </div>
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
            receipts.map((receipt) => (
              <div key={receipt.id} className="card link-box w-full bg-base-100 shadow-sm">
                <div className="card-body flex-row items-center justify-between gap-4 p-4 pb-1">
                  {/* Date Box */}
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-base-200">
                    <span className="font-bold text-2xs text-base-content/40 uppercase">
                      {new Date(receipt.date || receipt.savedAt).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="font-black text-lg leading-none">{new Date(receipt.date || receipt.savedAt).getDate()}</span>
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-bold text-base-content">{receipt.merchant.name}</h4>
                    <p className="flex items-center gap-1 truncate text-base-content/60 text-xs">
                      <Link href={`/receipt/${receipt.id}`} className="badge badge-xs badge-ghost link-overlay">
                        {receipt.merchant.type}
                      </Link>
                      <span>• {receipt.items.length} items</span>
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className="font-black text-base-content">${receipt.total_spent.toFixed(2)}</p>
                  </div>
                </div>
                <div className="card-body flex-row p-4 pt-0">
                  <dl className="stat gap-0 p-0 *:text-xs">
                    <dt className="stat-title">Expense</dt>
                    <dd className="stat-value badge badge-soft badge-xs badge-error rounded-sm bg-error/20 p-2">
                      {receipt.total_spent.toFixed(2)} {receipt.currency}
                    </dd>
                  </dl>
                  <dl className="stat gap-0 p-0 *:text-xs">
                    <dt className="stat-title">Including VAT</dt>
                    <dd className="stat-value badge badge-soft badge-xs badge-warning rounded-sm bg-warning/20 p-2">
                      {receipt.tax_amount.toFixed(2)} {receipt.currency}
                    </dd>
                  </dl>
                </div>
                <div className="card-body flex-row p-4 pt-0">
                  <p className="whitespace-pre-line text-xs">{`${receipt.merchant.name}\n${receipt.merchant.address}\nType: ${receipt.merchant.type}\n\nAI Insight: ${receipt.analysis.insight}`}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <button type="button" popoverTarget="my-drawer" popoverTargetAction="show" className="btn btn-primary sticky bottom-4 z-10 mx-auto flex">
        Create a Transaction
      </button>
    </>
  );
}
