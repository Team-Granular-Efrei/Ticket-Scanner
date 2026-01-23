"use client";

import { cva } from "class-variance-authority";
import { useState } from "react";
import { LuBadgeAlert, LuCircleCheckBig, LuInfo, LuX } from "react-icons/lu";
import { createContext } from "@/utils/create-context";
import { uuid } from "@/utils/functions";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const alertVariant = cva("alert slide-in-from-top-4 fade-in animate-in shadow-lg duration-300", {
  variants: {
    type: {
      success: "alert-success",
      error: "alert-error",
      info: "alert-info",
    },
  },
  defaultVariants: {
    type: "info",
  },
});

const icons = {
  success: <LuCircleCheckBig className="size-5" />,
  error: <LuBadgeAlert className="size-5" />,
  info: <LuInfo className="size-5" />,
};

const [ToastContextProvider, useToast] = createContext<ToastContextType>();

export { useToast };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = (message: string, type: ToastType = "info") => {
    const id = `toast_${uuid()}_${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const value: ToastContextType = {
    toast: addToast,
    success: (message) => addToast(message, "success"),
    error: (message) => addToast(message, "error"),
    info: (message) => addToast(message, "info"),
  };

  return (
    <ToastContextProvider value={value}>
      {children}
      {/* <div className="z-100"> */}
      {toasts.map((t) => (
        <div key={t.id} className="dialog-modal dialog dialog-top">
          <div className={alertVariant({ type: t.type })}>
            {icons[t.type]}
            <span>{t.message}</span>
            <button type="button" onClick={() => removeToast(t.id)} className="btn btn-ghost btn-xs btn-circle">
              <LuX className="size-4" />
            </button>
          </div>
        </div>
      ))}
      {/* </div> */}
    </ToastContextProvider>
  );
}
