import Link from "next/link";
import { notFound } from "next/navigation";
import { LuArrowLeft, LuTag } from "react-icons/lu";
import type { ReceiptData } from "@/lib/schema";
import { cn } from "@/utils/tw";
import { DeleteButton } from "./DeleteButton";

type ReceiptRecord = ReceiptData & { id: string | number; savedAt?: string };

async function getReceipt(id: string): Promise<ReceiptRecord | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipts/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (_e) {
    return null;
  }
}

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = await getReceipt(id);

  if (!receipt) {
    notFound();
  }

  const dateSource = receipt.date || receipt.savedAt;
  const formattedDate = dateSource ? new Date(dateSource).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unknown";
  const formattedTime = receipt.time
    ? receipt.time
    : receipt.savedAt
      ? new Date(receipt.savedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : "Unknown";

  return (
    <main className="mx-auto min-h-screen max-w-md bg-base-100 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 py-6">
        <Link href="/history" className="btn btn-circle btn-ghost btn-sm">
          <LuArrowLeft className="h-6 w-6" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-black text-2xl tracking-tighter">Receipt</h1>
          <p className="truncate text-base-content/50 text-xs">ID {receipt.id}</p>
        </div>
        <DeleteButton id={String(receipt.id)} />
      </div>

      {/* Summary Card */}
      <div className="card w-full border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body gap-4 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-black text-lg">{receipt.merchant?.name || "Unknown merchant"}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="badge badge-ghost badge-sm">{receipt.merchant?.type || "Other"}</span>
                {receipt.tax_amount !== undefined && <span className="badge badge-ghost badge-sm">Tax {receipt.tax_amount.toFixed(2)}</span>}
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-2xl">${receipt.total_spent.toFixed(2)}</p>
              <p className="text-base-content/50 text-xs uppercase">{receipt.currency}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-base-200 p-3">
              <p className="text-[10px] text-base-content/50 uppercase">Date</p>
              <p className="font-bold text-sm">{formattedDate}</p>
            </div>
            <div className="rounded-lg bg-base-200 p-3">
              <p className="text-[10px] text-base-content/50 uppercase">Time</p>
              <p className="font-bold text-sm">{formattedTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insight */}
      {receipt.analysis && (
        <div className="alert alert-soft alert-info mt-6 border">
          <div className="flex-1">
            <h3 className="font-bold text-xs uppercase">Insight</h3>
            <p className="font-medium text-sm italic opacity-80">{receipt.analysis.financial_advice}</p>
          </div>
          <div className={cn("badge border-none p-3 font-bold text-white", receipt.analysis.health_score > 70 ? "bg-success" : "bg-warning")}>
            {receipt.analysis.health_score}/100
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card mt-6 w-full bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <h3 className="bg-base-200/50 p-2 text-center font-bold text-base-content/40 text-xs uppercase tracking-wider">Items</h3>
          <ul>
            {receipt.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 p-3">
                <span className="rounded bg-base-200 px-2 py-1 font-bold text-xs">{item.quantity}x</span>
                <span className="flex-1 truncate font-medium">{item.name}</span>
                <span className="font-bold">${item.price.toFixed(2)}</span>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="badge badge-xs gap-1 text-[10px]">
                        <LuTag className="h-2 w-2 opacity-50" /> {tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
