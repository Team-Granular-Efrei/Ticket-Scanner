"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { LuCircleAlert, LuCircleCheck, LuInfo, LuX } from "react-icons/lu";

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

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
      const durations = {
        success: 3000,
        error: 5000,
        info: 3000,
      };
      setTimeout(() => removeToast(id), durations[type]);
    },
    [removeToast],
  );

  const value: ToastContextType = {
    toast: addToast,
    success: (message) => addToast(message, "success"),
    error: (message) => addToast(message, "error"),
    info: (message) => addToast(message, "info"),
  };

  const icons = {
    success: <LuCircleCheck className="h-5 w-5" />,
    error: <LuCircleAlert className="h-5 w-5" />,
    info: <LuInfo className="h-5 w-5" />,
  };

  const styles = {
    success: "alert-success",
    error: "alert-error",
    info: "alert-info",
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast toast-top toast-center z-[100]">
        {toasts.map((t) => (
          <div key={t.id} className={`alert ${styles[t.type]} slide-in-from-top-4 fade-in animate-in shadow-lg duration-300`}>
            {icons[t.type]}
            <span className="font-medium">{t.message}</span>
            <button type="button" onClick={() => removeToast(t.id)} className="btn btn-ghost btn-xs btn-circle">
              <LuX className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
