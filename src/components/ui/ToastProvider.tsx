"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { ToastContainer } from "./Toast";
import type { Toast, ToastType } from "./Toast";

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * ToastProvider - Global toast notification provider
 *
 * Manages toast queue and provides showToast function via context.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const toast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

/**
 * useToast - Hook for showing toast notifications
 *
 * Usage:
 * const toast = useToast();
 * toast.success("Bookmark saved!");
 * toast.error("Failed to delete bookmark");
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  // Memoize to return stable reference, safe for useEffect dependencies
  return useMemo(
    () => ({
      show: context.showToast,
      success: (message: string, duration?: number) =>
        context.showToast(message, "success", duration),
      error: (message: string, duration?: number) =>
        context.showToast(message, "error", duration),
      info: (message: string, duration?: number) =>
        context.showToast(message, "info", duration),
      dismiss: context.dismissToast,
    }),
    [context]
  );
}
