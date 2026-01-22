"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { LuBadgeInfo, LuChartPie, LuCheck, LuCopy, LuPlus, LuReceipt, LuSave, LuTag, LuTags, LuTrash2, LuX } from "react-icons/lu";
import { RiArrowDownSFill, RiArrowLeftSFill, RiArrowRightSFill } from "react-icons/ri";
import { deleteReceipt } from "@/app/actions/delete";
import { type SaveState, saveReceipt } from "@/app/actions/save";
import { BudgetCategory, type ReceiptData } from "@/lib/schema";
import { useToast } from "@/providers/toast";
import { uuid } from "@/utils/functions";

export function ReceiptEditor({ initialData, isUpdate, onSave }: { initialData: ReceiptData; isUpdate?: boolean; onSave?: (state: SaveState) => void }) {
  // const [state, formAction, isPending] = useActionState(saveReceipt, initialState);
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialData.items);
  const [feedback, setFeedback] = useState<SaveState | null>(null);
  const navigate = useRouter();
  const success = useToast((ctx) => ctx.success);
  const error = useToast((ctx) => ctx.error);

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: `generated_${uuid()}`,
        name: "",
        price: 0,
        quantity: 1,
        category: "Other",
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData(e.currentTarget);

    const receiptData: ReceiptData = {
      currency: initialData.currency,
      date: formData.get("date") as string,
      discount: Number(formData.get("discount") as string),
      id: initialData.id,
      items: items.map(
        (item) =>
          ({
            id: item.id.startsWith("generated_") ? undefined : item.id, // ID will be generated server-side if new
            category: BudgetCategory.parse(formData.get(`item_${item.id}_category`) as string),
            name: formData.get(`item_${item.id}_name`) as string,
            price: Number(formData.get(`item_${item.id}_price`) as string),
            quantity: Number(formData.get(`item_${item.id}_quantity`) as string),
          }) as ReceiptData["items"][0],
      ),
      tax_amount: Number(formData.get("tax_amount") as string),
      time: formData.get("time") as string,
      total_spent: totalAmount,
      service_charge: Number(formData.get("service_charge") as string),
      merchant: {
        address: initialData.merchant.address,
        name: initialData.merchant.name,
        type: initialData.merchant.type,
      },
      analysis: {
        insight: initialData.analysis.insight,
      },
      note: formData.get("receipt-details") as string,
    };

    // 2. Call Server Action
    startTransition(async () => {
      if (isUpdate) {
        const result = await saveReceipt(receiptData);
        setFeedback(result);
      } else {
        const result = await saveReceipt(receiptData);
        setFeedback(result);
      }
    });
  };

  const handleDelete = () => {
    // 2. Call Server Action
    startTransition(async () => {
      const result = await deleteReceipt(initialData.id);
      setFeedback(result);
    });
  };

  useEffect(() => {
    if (feedback?.success) {
      success(feedback.message);
    } else if (feedback && !feedback.success) {
      error(feedback.message);
    }
  }, [feedback, success, error]);

  useEffect(() => {
    if (feedback && onSave) {
      onSave(feedback);
    } else if (feedback?.success) {
      navigate.push("/", { scroll: true });
    }
  }, [feedback, onSave, navigate]);

  return (
    <>
      <form onSubmit={handleSubmit} className="relative min-h-dvh pb-32">
        {/* Hidden ID if updating */}
        <input type="hidden" name="id" value={initialData.id} />
        <input type="hidden" name="currency" value={initialData.currency} />

        {/* BASIC INFORMATION */}
        <div className="flex w-full flex-col gap-2 bg-base-200 p-4 pb-2">
          <p className="text-center text-xs">Basic information for all transactions.</p>
          {/* Date */}
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-ghost btn-circle btn-sm">
              <RiArrowLeftSFill className="icon size-5" />
            </button>
            <div className="input input-base-content input-soft grow cursor-default justify-center gap-0.5">
              <input type="date" name="date" id="date" className="w-21" defaultValue={initialData.date} />
              <input type="time" name="time" id="time" className="w-fit" defaultValue={initialData.time} />
            </div>
            <button type="button" className="btn btn-ghost btn-circle btn-sm">
              <RiArrowRightSFill className="icon size-5" />
            </button>
          </div>

          {/* Currency */}
          <span className="badge badge-sm self-center">{initialData.currency}</span>
        </div>

        {/* ITEMS DETAIL */}
        {items.map((item, idx) => {
          return (
            <div key={item.id} className="mt-2 flex w-full flex-col bg-base-200 p-4 pb-2">
              {/* ACTION ON RECEIPT ITEM */}
              <div className="flex items-center gap-2">
                <span className="font-bold">{idx + 1})</span>
                {/* CATEGORY SELECTOR */}
                <div className="btn btn-soft grow justify-between p-1">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-base-200">🍔</span>
                  <span className="font-bold text-sm">{item.category}</span>
                  <RiArrowDownSFill className="icon size-5" />
                  {/* Invisible Select overlay */}
                  <select
                    id={`item_${item.id}_category`}
                    name={`item_${item.id}_category`}
                    className="absolute inset-0 size-full cursor-[inherit] opacity-0"
                    defaultValue={item.category}
                  >
                    {BudgetCategory.options.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                {/* COPY BUTTON */}
                <button type="button" className="btn btn-soft btn-square btn-sm btn-info rounded-lg">
                  <LuCopy className="icon size-4" />
                </button>
                {/* DELETE BUTTON */}
                <button type="button" className="btn btn-soft btn-square btn-sm btn-error rounded-lg" onClick={() => removeItem(item.id)}>
                  <LuX className="icon size-4" />
                </button>
              </div>

              {/* INPUT ON RECEIPT ITEM */}
              <div className="flex items-center gap-2">
                <div className="w-12 space-y-1">
                  <label htmlFor={`item_${item.id}_quantity`} className="label ml-0.5 text-xs">
                    Qte
                  </label>
                  <input
                    id={`item_${item.id}_quantity`}
                    name={`item_${item.id}_quantity`}
                    type="number"
                    defaultValue={item.quantity}
                    placeholder="..."
                    className="input input-soft input-base-content min-w-0 text-center"
                  />
                </div>
                <div className="grow space-y-1">
                  <label htmlFor={`item_${item.id}_name`} className="label ml-0.5 text-xs">
                    Note
                  </label>
                  <input
                    id={`item_${item.id}_name`}
                    name={`item_${item.id}_name`}
                    type="text"
                    defaultValue={item.name}
                    placeholder="..."
                    className="input input-soft input-base-content w-full"
                  />
                </div>
                <div className="w-23 space-y-1">
                  <label htmlFor={`item_${item.id}_price`} className="label ml-0.5 text-xs">
                    Amount
                  </label>
                  <input
                    id={`item_${item.id}_price`}
                    name={`item_${item.id}_price`}
                    type="number"
                    defaultValue={item.price.toFixed(2)}
                    placeholder="0"
                    className="input input-soft input-base-content text-right"
                  />
                </div>
              </div>

              {/* DISCOUNT & TOTAL */}
              {/* We must redistribute the discount among items (if they are concerned) proportionally. */}
              <div className="mt-1 flex items-center justify-between">
                <span className="badge badge-soft badge-xs badge-error bg-error/20 px-1 py-3">
                  <input type="checkbox" className="toggle toggle-soft toggle-xs toggle-error" />
                  Discount : {initialData.discount ? (initialData.discount / initialData.items.length).toFixed(2) : "0.00"}
                </span>
                {/* The item total after discount: */}
                <dl className="stat flex-row p-0 *:text-xs">
                  <dt className="stat-title">Total :</dt>
                  <dd className="stat-value">
                    {item.price.toFixed(2)} {initialData.currency}
                  </dd>
                </dl>
              </div>
            </div>
          );
        })}

        {/* ADD NEW ITEM BUTTON  */}
        <div className="mt-2 flex w-full flex-col">
          <button className="btn btn-soft btn-sm btn-info self-center" type="button" onClick={addItem}>
            <LuPlus className="icon size-4" /> Add
          </button>
        </div>

        {/* RECEIPT LEVEL DETAILS */}
        <div className="mt-2 flex w-full flex-col bg-base-200 p-4 pb-0">
          <div className="collapse">
            {/* Should be checked by default if the AI find a VAT or a discount on the receipt. */}
            <input
              type="checkbox"
              defaultChecked={!!(initialData.tax_amount && initialData.discount && (initialData.tax_amount > 0 || initialData.discount > 0))}
              className="toggle toggle-soft toggle-success absolute top-0 right-0 col-start-auto row-start-auto mt-2 opacity-100"
            />
            <div className="collapse-title cursor-default p-0">
              <div className="flex w-full items-start gap-2">
                <span className="badge badge-soft badge-info mt-2 size-10 rounded-full bg-info/20">
                  <LuReceipt className="icon size-6" />
                </span>
                <div className="max-w-9/12">
                  <h2 className="font-bold text-sm">Receipt</h2>
                  <p className="text-xs opacity-60">
                    The items in the group are in the same receipt. You can save details about VAT and other service charges.
                  </p>
                </div>
              </div>
            </div>
            <div className="collapse-content px-0 pt-2">
              <hr className="divider m-0 h-px" />
              {/* VAT */}
              <div className="flex w-full items-start gap-2 py-2">
                <span className="badge badge-soft badge-warning mt-2 size-10 rounded-full bg-warning/20">
                  <LuTag className="icon size-6" />
                </span>
                <div className="grow">
                  <h2 className="font-bold text-sm">VAT</h2>
                  <div className="tabs tabs-box w-fit rounded-lg bg-base-300 p-1 shadow-none">
                    <input type="radio" name="vat" aria-label="Include" className="tab h-5 text-contrast text-xs checked:bg-warning" defaultChecked />
                    <input type="radio" name="vat" aria-label="Exclude" className="tab h-5 text-contrast text-xs checked:bg-warning" />
                    <div className="tab-content flex items-center gap-2">
                      <input type="checkbox" className="toggle toggle-soft toggle-sm toggle-success" defaultChecked />
                      <p className="text-xs">Distribute this portion to each transaction in proportion.</p>
                    </div>
                  </div>
                </div>
                <input
                  id="vat-amount"
                  name="tax_amount"
                  type="number"
                  placeholder="0"
                  defaultValue={initialData.tax_amount}
                  className="input input-soft input-base-content w-23 text-right"
                />
              </div>
              <hr className="divider m-0 h-px" />
              {/* DISCOUNT */}
              <div className="flex w-full flex-wrap items-center gap-2 pt-2">
                <span className="badge badge-soft badge-error size-10 rounded-full bg-error/20">
                  <LuTags className="icon size-6" />
                </span>
                <h2 className="grow font-bold text-sm">Discount</h2>
                <input
                  id="discount-amount"
                  name="discount"
                  type="number"
                  placeholder="0"
                  defaultValue={initialData.discount}
                  className="input input-soft input-base-content w-23 text-right"
                />
                <div className="flex w-full items-center gap-2">
                  <input type="checkbox" className="toggle toggle-soft toggle-sm toggle-error" />
                  <p className="text-xs">Distribute this portion to each transaction in proportion.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RECEIPT LEVEL NOTES */}
        <div className="mt-2 flex w-full flex-col bg-base-200 p-4">
          <div className="flex w-full flex-wrap items-start gap-2 py-1">
            <span className="badge badge-soft badge-info size-10 rounded-full bg-info/20">
              <LuBadgeInfo className="icon size-6" />
            </span>
            <div>
              <span className="font-semibold text-sm">Note</span>
              <p className="text-xs opacity-60">Write some detail.</p>
            </div>
            <textarea
              name="receipt-details"
              id="receipt-details"
              defaultValue={
                initialData.note ||
                `${initialData.merchant.name}\n${initialData.merchant.address}\nType: ${initialData.merchant.type}\n\nAI Insight: ${initialData.analysis.insight}`
              }
              placeholder="..."
              className="input input-soft input-base-content min-h-20 w-full"
            />
          </div>
        </div>

        {/* FLOATING SAVE */}
        <div className="sticky bottom-8 z-20 flex justify-center">
          <button type="button" className="btn btn-success" popoverTarget="my-drawer-5" popoverTargetAction="show">
            <LuSave className="icon size-5" />
            Save
          </button>
        </div>

        <div id="my-drawer-5" className="drawer drawer-bottom drawer-animated drawer-modal h-[80dvh] rounded-t-2xl bg-base-100" popover="auto">
          <div className="card size-full">
            <div className="card-body h-full">
              <div className="mb-2 flex items-center gap-2 rounded-xl p-2 shadow-md">
                <span className="badge badge-soft badge-info size-10 rounded-ld bg-info/20">
                  <LuBadgeInfo className="icon size-6" />
                </span>
                <div>
                  <span className="font-semibold text-sm">My transactions</span>
                  <p className="text-xs opacity-60">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-soft btn-square btn-sm btn-base-content ml-auto rounded-lg"
                  popoverTarget="my-drawer-5"
                  popoverTargetAction="hide"
                >
                  <LuX className="icon size-4" />
                </button>
              </div>

              <div className="grow space-y-2 overflow-auto p-1">
                {items.map((item) => {
                  return (
                    <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-md p-2 shadow-sm">
                      <span className="badge badge-soft badge-info size-8 rounded-ld bg-info/20">
                        <LuBadgeInfo className="icon size-6" />
                      </span>
                      <div>
                        <span className="font-semibold text-xs">{item.category}</span>
                        <p className="text-2xs opacity-60">
                          {initialData.date} {initialData.time}
                        </p>
                      </div>
                      <dl className="stat badge badge-soft badge-xs ml-auto flex-row items-center gap-0.5 rounded-2xl rounded-ld px-1 py-2 text-error">
                        <RiArrowDownSFill className="icon size-4" />
                        <dd className="stat-value text-xs">{item.price.toFixed(2)}</dd>
                        <span className="ml-0.5 text-2xs">{initialData.currency}</span>
                      </dl>
                      <p className="w-full text-2xs">{item.name}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 rounded-md p-2 shadow-sm">
                <span className="badge badge-soft badge-info size-10 rounded-ld bg-info/20">
                  <LuBadgeInfo className="icon size-6" />
                </span>
                <div>
                  <span className="font-semibold text-sm">Total</span>
                  <p className="text-xs opacity-60">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <dl className="stat badge badge-soft badge-xs ml-auto flex-row items-center gap-0.5 rounded-2xl rounded-ld px-1 py-2.5 text-error">
                  <RiArrowDownSFill className="icon size-4" />
                  <dd className="stat-value text-sm">{items.reduce((acc, item) => acc + item.price, 0).toFixed(2)}</dd>
                  <span className="ml-0.5 text-xs">{initialData.currency}</span>
                </dl>
              </div>

              <button type="submit" disabled={isPending} className="btn btn-success">
                {isPending ? <span className="loading loading-spinner loading-sm" /> : <LuCheck className="icon size-5" />}
                Save
              </button>
            </div>
          </div>
        </div>
      </form>

      <div id="my-drawer-6" className="drawer drawer-bottom drawer-animated drawer-modal h-[80dvh] rounded-t-2xl bg-base-100" popover="auto">
        <div className="card w-full">
          <div className="card-body">
            <h2 className="card-title text-center text-primary text-sm">Receipt Option</h2>
            <p className="-mt-2 text-center text-xs">Choose options for this receipt.</p>
            <Link href="/analytics" className="btn btn-soft btn-secondary w-full justify-between py-6">
              Analytics
              <LuChartPie className="icon size-5" />
            </Link>
            <button type="button" className="btn btn-error w-full justify-between py-6" popoverTarget="my-dialog-1" popoverTargetAction="show">
              Delete Receipt
              <LuTrash2 className="icon size-5" />
            </button>
          </div>
        </div>
      </div>

      <div id="my-dialog-1" className="dialog dialog-center dialog-animated dialog-modal rounded-2xl bg-base-100" popover="manual">
        <div className="card w-sm">
          <div className="card-body">
            <h2 className="card-title text-center text-primary">Delete Receipt</h2>
            <p className="text-center">Are you sure you want to delete this receipt? This action cannot be undone.</p>
            <div className="card-action mt-4 justify-center">
              <button type="button" className="btn justify-between py-6" popoverTarget="my-dialog-1" popoverTargetAction="hide">
                Cancel
              </button>
              <button type="button" disabled={isPending} className="btn btn-error justify-between py-6" popoverTarget="my-dialog-1" onClick={handleDelete}>
                {isPending && <span className="loading loading-spinner loading-sm" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
