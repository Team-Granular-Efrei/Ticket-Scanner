"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuPencil, LuX } from "react-icons/lu";
import { updateReceipt } from "@/app/actions/save";
import { BudgetCategory } from "@/lib/schema";

type ReceiptEditData = {
  id: string;
  merchant: { name: string; type: string };
  date?: string;
  time?: string;
  total_spent: number;
};

const categories = BudgetCategory.options;

export function EditButton({ receipt }: { receipt: ReceiptEditData }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    merchantName: receipt.merchant.name,
    merchantType: receipt.merchant.type,
    date: receipt.date || "",
    time: receipt.time || "",
    total_spent: receipt.total_spent,
  });

  async function handleSave() {
    setIsSaving(true);
    const result = await updateReceipt(receipt.id, {
      merchant: {
        name: formData.merchantName,
        type: formData.merchantType as (typeof categories)[number],
      },
      date: formData.date || undefined,
      time: formData.time || undefined,
      total_spent: formData.total_spent,
    });

    if (result.success) {
      setIsOpen(false);
      router.refresh();
    }
    setIsSaving(false);
  }

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="btn btn-ghost btn-sm">
        <LuPencil className="h-4 w-4" />
        Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-sm bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Edit Receipt</h3>
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-circle btn-ghost btn-sm">
                  <LuX className="h-4 w-4" />
                </button>
              </div>

              <div className="form-control mt-4">
                <label className="label" htmlFor="merchantName">
                  <span className="label-text">Merchant Name</span>
                </label>
                <input
                  id="merchantName"
                  type="text"
                  value={formData.merchantName}
                  onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="merchantType">
                  <span className="label-text">Category</span>
                </label>
                <select
                  id="merchantType"
                  value={formData.merchantType}
                  onChange={(e) => setFormData({ ...formData, merchantType: e.target.value })}
                  className="select select-bordered w-full"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label" htmlFor="date">
                    <span className="label-text">Date</span>
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label" htmlFor="time">
                    <span className="label-text">Time</span>
                  </label>
                  <input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label" htmlFor="total">
                  <span className="label-text">Total</span>
                </label>
                <input
                  id="total"
                  type="number"
                  step="0.01"
                  value={formData.total_spent}
                  onChange={(e) => setFormData({ ...formData, total_spent: Number.parseFloat(e.target.value) || 0 })}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="card-actions mt-4 justify-end">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-ghost" disabled={isSaving}>
                  Cancel
                </button>
                <button type="button" onClick={handleSave} className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? <span className="loading loading-spinner loading-xs" /> : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
