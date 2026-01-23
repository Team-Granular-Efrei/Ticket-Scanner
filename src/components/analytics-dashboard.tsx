"use client";

import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { ReceiptData } from "@/lib/schema";
import { cn } from "@/utils/tw";

// Custom "Wallet" Color Palette
const COLORS = {
  Groceries: "#32D74B", // Green
  Dining: "#FFD60A", // Yellow
  Transport: "#0A84FF", // Blue
  Entertainment: "#BF5AF2", // Purple
  Utilities: "#FF453A", // Red
  Shopping: "#FF9F0A", // Orange
  Health: "#FF375F", // Pink
  Services: "#64D2FF", // Cyan
  Other: "#8E8E93", // Gray
  Tech: "#27E3AB", // Your Brand Teal
  Housing: "#AC8E68", // Brown
  Clothing: "#FFD60A", // Yellow
};

export function AnalyticsDashboard({ receipts }: { receipts: (ReceiptData & { savedAt: string })[] }) {
  const [activeTab, setActiveTab] = useState<"overview" | "breakdown">("overview");

  // Determine the currency to display (fallback to EUR if no receipts)
  // We take the currency from the most recent receipt (first in the array usually)
  const currency = receipts.length > 0 ? receipts[0].currency : "EUR";

  // 1. Transform Data for "Category Breakdown" (Donut Chart)
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    receipts.forEach((r) => {
      r.items.forEach((item) => {
        const cat = item.category || "Other";
        const current = map.get(cat) || 0;
        map.set(cat, current + item.price);
      });
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [receipts]);

  // 2. Transform Data for "Daily Spend" (Bar Chart)
  const dailyData = useMemo(() => {
    const map = new Map<string, number>();
    receipts.forEach((r) => {
      // Use receipt date if available, else saved date
      const dateRaw = r.date || r.savedAt.split("T")[0];
      const date = new Date(dateRaw).toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      const current = map.get(date) || 0;
      map.set(date, current + r.total_spent);
    });
    // Take last 7 entries
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .slice(-7);
  }, [receipts]);

  const totalSpent = categoryData.reduce((acc, curr) => acc + curr.value, 0);

  useEffect(() => {
    document.getElementById("my-drawer-4")?.hidePopover();
  }, []);

  return (
    <div className="fade-in slide-in-from-bottom-4 animate-in space-y-6 duration-700">
      {/* Tab Switcher */}
      <div className="flex justify-center">
        <div className="tabs tabs-box rounded-full bg-base-200 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn("tab rounded-full px-6 transition-all", activeTab === "overview" && "bg-base-100 font-bold text-primary shadow-sm")}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("breakdown")}
            className={cn("tab rounded-full px-6 transition-all", activeTab === "breakdown" && "bg-base-100 font-bold text-primary shadow-sm")}
          >
            Breakdown
          </button>
        </div>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* Main Chart: Daily Activity */}
          <div className="card w-full bg-base-100 shadow-xl">
            <div className="card-body p-6">
              <h3 className="mb-4 font-bold text-base-content/50 text-sm uppercase">Last 7 Days</h3>
              <div className="h-50 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--color-base-content)", fontSize: 10 }} dy={10} />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            // Display dynamic currency in Tooltip
                            <div className="rounded-lg bg-base-100 p-2 font-bold text-xs shadow-xl">
                              {Number(payload[0].value).toFixed(2)} {currency}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 4, 4]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex gap-4">
            <div className="card grow bg-base-200 shadow-sm">
              <div className="card-body p-4">
                <p className="font-bold text-base-content/50 text-xs uppercase">Avg. Ticket</p>
                <p className="font-bold text-2xl">
                  {/* Display dynamic currency */}
                  {receipts.length ? (totalSpent / receipts.length).toFixed(0) : 0} {currency}
                </p>
              </div>
            </div>
            <div className="card grow bg-base-200 shadow-sm">
              <div className="card-body p-4">
                <p className="font-bold text-base-content/50 text-xs uppercase">Transactions</p>
                <p className="font-bold text-2xl text-primary">{receipts.length}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Breakdown Tab: Donut Chart */
        <div className="card w-full bg-base-200 shadow-xl">
          <div className="card-body flex flex-row items-center gap-6 p-6">
            {/* The Chart */}
            <div className="relative size-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                    {categoryData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-bold text-2xs text-base-content/50 uppercase">Total</span>
                {/* Display dynamic currency */}
                <span className="font-black text-xl">
                  {totalSpent.toFixed(0)} {currency}
                </span>
              </div>
            </div>

            {/* The Legend */}
            <div className="max-h-50 flex-1 space-y-3 overflow-y-auto pr-2">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] || COLORS.Other }}></span>
                    <span className="font-bold text-base-content/80">{item.name}</span>
                  </div>
                  {/* Display dynamic currency */}
                  <span className="font-mono text-base-content/50">
                    {item.value.toFixed(0)} {currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
