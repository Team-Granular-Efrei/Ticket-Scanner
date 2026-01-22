import Link from "next/link";
import { LuChartPie, LuChevronLeft } from "react-icons/lu";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

async function getReceipts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/receipts`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch (_e) {
    return [];
  }
}

export default async function AnalyticsPage() {
  const receipts = await getReceipts();

  return (
    <main className="min-h-screen bg-base-100 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-base-100">
        <nav className="flex h-(--header-height) items-center justify-between p-2">
          <Link href="/" className="btn btn-ghost btn-circle btn-sm">
            <LuChevronLeft className="icon size-6" />
          </Link>
          <h1 className="text-center font-bold text-lg">Analytics</h1>
          <span className="btn btn-circle btn-sm pointer-events-none opacity-0" />
        </nav>
      </header>

      <div className="mx-auto max-w-xl p-4">
        {receipts.length > 0 ? (
          <AnalyticsDashboard receipts={receipts} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <LuChartPie className="mb-4 h-16 w-16 text-base-content/20" />
            <p>No data to analyze yet.</p>
            <Link href="/" className="btn btn-link btn-sm mt-2">
              Scan Receipt
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
