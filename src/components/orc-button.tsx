"use client";

import { startTransition, useActionState, useEffect } from "react";
import { LuCamera, LuImages } from "react-icons/lu";
import { type AnalysisState, analyzeReceipt } from "@/app/actions/analyze";
import { useReceipt } from "@/providers/receipt";

const initialState: AnalysisState = { status: "idle" };

export default function OCRButton() {
  const [state, formAction, _isPending] = useActionState(analyzeReceipt, initialState);
  const setDraft = useReceipt((ctx) => ctx?.setDraft);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setDraft(null);

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      document.getElementById("my-drawer-3")?.showPopover();

      startTransition(() => formAction(formData));
    }
  };

  useEffect(() => {
    if (state.status === "success" && state.data) {
      setDraft(state.data);
    }
  }, [state, setDraft]);

  return (
    <>
      {/* 1. Gallery Button - Standard File Picker */}
      <label className="btn btn-soft btn-primary w-full justify-between py-6">
        <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
        Gallery
        <LuImages className="icon size-5" />
      </label>

      {/* 2. Camera Button - Forces Native Camera */}
      <label className="btn btn-soft btn-warning w-full justify-between py-6">
        <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleFileChange} />
        Camera
        <LuCamera className="icon size-5" />
      </label>
    </>
  );
}
