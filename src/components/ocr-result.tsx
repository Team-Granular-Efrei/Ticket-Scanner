"use client";

import { LuChevronLeft, LuSettings } from "react-icons/lu";
import { useReceipt } from "@/providers/receipt";
import { ReceiptEditor } from "./receipt-editor";

export default function OCRResult() {
  const draft = useReceipt((ctx) => ctx?.draft);

  if (!draft) {
    return (
      <main className="float-middle-center flex flex-col items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="mt-4 text-sm uppercase tracking-wider">Analyzing Receipt...</p>
      </main>
    );
  }
  return (
    <>
      <header className="sticky top-0 z-20 bg-base-100">
        <nav className="flex h-(--header-height) items-center justify-between p-2">
          <button type="button" className="btn btn-ghost btn-circle btn-sm" popoverTarget="my-drawer-3" popoverTargetAction="hide">
            <LuChevronLeft className="icon size-6" />
          </button>
          <h1 className="text-center font-bold text-lg">My transactions</h1>
          <button type="button" className="btn btn-ghost btn-circle btn-sm">
            <LuSettings className="icon size-6" />
          </button>
        </nav>
      </header>
      <ReceiptEditor
        initialData={draft}
        onSave={(state) => {
          if (state.success) {
            document.getElementById("my-drawer-3")?.hidePopover();
          }
        }}
      />
    </>
  );
}
