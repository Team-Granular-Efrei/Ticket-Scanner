"use client";

import Link from "next/link";
import { startTransition, useActionState, useCallback, useEffect, useId, useRef, useState } from "react";
import { LuCalendar, LuCamera, LuRefreshCw, LuSave, LuStore, LuTag, LuWallet } from "react-icons/lu";
import { type AnalysisState, analyzeReceipt } from "@/app/actions/analyze";
import { BudgetCategory, type ReceiptData } from "@/lib/schema";
import { useToast } from "@/providers/toast";
import { cn } from "@/utils/tw";
import { saveReceipt } from "./actions/save";

const initialState: AnalysisState = { status: "idle" };

export default function Home() {
  const [state, formAction, isPending] = useActionState(analyzeReceipt, initialState);
  const { success, error, info } = useToast();

  const id = useId();
  const ids = {
    fileInput: `${id}-file-input`,
    merchantNameInput: `${id}-merchant-name-input`,
    dateInput: `${id}-date-input`,
    categorySelect: `${id}-category-select`,
  };

  const [data, setData] = useState<ReceiptData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track if we've already processed the current state
  const processedStateRef = useRef<string | null>(null);

  async function handleSave() {
    if (!data) {
      return;
    }
    setIsSaving(true);

    const result = await saveReceipt(data);

    setIsSaving(false);
    if (result.success) {
      success("Receipt saved to Wallet!");
      resetScanner();
    } else {
      error(result.error || "Failed to save receipt");
    }
  }

  const resetScanner = useCallback(() => {
    setData(null);
    processedStateRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Handle state changes from analysis
  useEffect(() => {
    // Create a unique key for this state
    const stateKey = state.status === "success" ? `success-${state.data?.id}` : state.status;

    // Skip if we've already processed this state
    if (processedStateRef.current === stateKey) {
      return;
    }

    if (state.status === "success" && state.data) {
      processedStateRef.current = stateKey;
      setData(state.data);
      success("Receipt analyzed successfully!");
    } else if (state.status === "error") {
      processedStateRef.current = stateKey;
      error(state.error || "Analysis failed");
      resetScanner();
    }
  }, [state, success, error, resetScanner]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      info("Analyzing receipt...");
      const formData = new FormData();
      formData.append("file", file);
      startTransition(() => formAction(formData));
    }
  }

  function updateField(section: keyof ReceiptData, value: unknown) {
    if (!data) {
      return;
    }
    setData({ ...data, [section]: value });
  }

  function updateMerchant(key: string, value: string) {
    if (!data) {
      return;
    }
    setData({ ...data, merchant: { ...data.merchant, [key]: value } });
  }

  // Show scanner when no data and not pending
  const showScanner = !data && !isPending;
  // Show editor when we have data and not pending
  const showEditor = data && !isPending;

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-base-100 p-4 pb-24">
      {/* HEADER */}
      <div className="flex w-full max-w-md items-center justify-between py-6">
        <h1 className="font-black text-2xl tracking-tighter">
          Granular<span className="text-primary">.</span>
        </h1>
        <div className="flex items-center gap-2">
          <Link href="/history" className="btn btn-ghost btn-sm">
            <LuWallet className="h-4 w-4" />
            Wallet
          </Link>
          {data && <div className="badge badge-primary badge-outline">{data.analysis.health_score}/100</div>}
        </div>
      </div>

      {/* --- STATE 1: IDLE (Scanner) --- */}
      {showScanner && (
        <div className="fade-in flex flex-1 animate-in flex-col items-center justify-center gap-8">
          <label htmlFor={ids.fileInput} className={cn("btn btn-circle btn-xl group relative h-32 w-32 border-base-300 bg-base-200 shadow-2xl")}>
            <input ref={fileInputRef} id={ids.fileInput} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
            <LuCamera className="h-12 w-12 text-primary transition-transform group-hover:scale-110" />
            <span className="absolute -bottom-8 font-bold text-base-content/40 text-sm uppercase tracking-widest">Scan Receipt</span>
          </label>
        </div>
      )}

      {/* --- STATE 2: LOADING --- */}
      {isPending && (
        <div className="fade-in absolute inset-0 z-50 flex animate-in flex-col items-center justify-center bg-base-100/90 backdrop-blur-sm">
          <div className="loading loading-infinity loading-xl scale-150 text-primary"></div>
          <p className="mt-4 animate-pulse font-bold text-lg">Extracting Intelligence...</p>
        </div>
      )}

      {/* --- STATE 3: EDITOR (The Wallet UI) --- */}
      {showEditor && (
        <div className="slide-in-from-bottom-8 w-full max-w-md animate-in space-y-6 duration-500">
          {/* 1. Merchant Card */}
          <div className="card w-full border border-base-300 bg-base-200 shadow-sm">
            <div className="card-body gap-4 p-4">
              {/* Merchant Name Input */}
              <div className="form-control w-full">
                <label htmlFor={ids.merchantNameInput} className="label pb-1 font-bold text-base-content/50 text-xs uppercase">
                  Merchant
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 focus-within:border-primary">
                  <LuStore className="text-base-content/40" />
                  <input
                    id={ids.merchantNameInput}
                    type="text"
                    value={data.merchant.name}
                    onChange={(e) => updateMerchant("name", e.target.value)}
                    className="input input-ghost h-12 w-full font-bold text-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                {/* Date Input */}
                <div className="form-control flex-1">
                  <label htmlFor={ids.dateInput} className="label pb-1 font-bold text-base-content/50 text-xs uppercase">
                    Date
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3">
                    <LuCalendar className="text-base-content/40" />
                    <input
                      id={ids.dateInput}
                      type="date"
                      value={data.date || ""}
                      onChange={(e) => updateField("date", e.target.value)}
                      className="input input-ghost h-10 w-full font-medium text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category Select */}
                <div className="form-control flex-1">
                  <label htmlFor={ids.categorySelect} className="label pb-1 font-bold text-base-content/50 text-xs uppercase">
                    Category
                  </label>
                  <select
                    id={ids.categorySelect}
                    className="select select-bordered select-sm w-full bg-base-100"
                    value={data.merchant.type}
                    onChange={(e) => updateMerchant("type", e.target.value)}
                  >
                    {BudgetCategory.options.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Analysis Alert */}
          <div className="alert alert-soft alert-info border">
            <div className="flex-1">
              <h3 className="font-bold text-xs uppercase">Granular Insight</h3>
              <p className="font-medium text-sm italic opacity-80">"{data.analysis.financial_advice}"</p>
            </div>
          </div>

          {/* 3. Line Items (Editable) */}
          <div className="card w-full bg-base-100 shadow-sm">
            <div className="card-body p-0">
              <h3 className="bg-base-200/50 p-2 text-center font-bold text-base-content/40 text-xs uppercase tracking-wider">Parsed Items</h3>
              <ul className="">
                {data.items.map((item, index) => (
                  <li key={item.id} className="flex items-center gap-3 p-3">
                    {/* Quantity Input */}
                    <input
                      type="number"
                      className="input input-xs input-ghost w-8 bg-base-200 font-bold [&::-webkit-inner-spin-button]:hidden"
                      value={item.quantity}
                      min={1}
                      max={9}
                      onChange={(e) => {
                        const newItems = [...data.items];
                        newItems[index].quantity = Number(e.target.value);
                        updateField("items", newItems);
                      }}
                    />

                    {/* Name Input */}
                    <input
                      type="text"
                      className="input input-sm input-ghost flex-1 grow font-medium focus:bg-base-200"
                      value={item.name}
                      onChange={(e) => {
                        const newItems = [...data.items];
                        newItems[index].name = e.target.value;
                        updateField("items", newItems);
                      }}
                    />

                    {/* Price Input */}
                    <label className="input input-sm w-16 has-focus:bg-base-200 has-focus:outline-none">
                      <span className="text-base-content/40 text-xs">$</span>
                      <input
                        type="number"
                        min={0}
                        className="w-8 text-right font-bold"
                        value={item.price}
                        onChange={(e) => {
                          const newItems = [...data.items];
                          newItems[index].price = Number(e.target.value);
                          updateField("items", newItems);
                        }}
                      />
                    </label>

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
            {/* Total Footer */}
            <div className="card-action items-center justify-between bg-base-200/50 p-4">
              <span className="font-bold text-base-content/60 text-sm uppercase">Total</span>
              <span className="font-black text-2xl text-primary tracking-tight">${data.total_spent}</span>
            </div>
          </div>

          {/* 4. Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                info("Receipt discarded");
                resetScanner();
              }}
              className="btn btn-outline border-base-300 hover:border-base-400 hover:bg-base-200"
              disabled={isSaving}
            >
              <LuRefreshCw /> Discard
            </button>

            <button type="button" onClick={handleSave} disabled={isSaving} className="btn btn-primary shadow-lg shadow-primary/20">
              {isSaving ? <span className="loading loading-spinner loading-sm"></span> : <LuSave />}
              {isSaving ? "Saving..." : "Save to Wallet"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
