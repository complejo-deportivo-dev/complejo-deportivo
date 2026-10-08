"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastProps {
  variant: ToastVariant;
  message: string;
  duration?: number;
  onClose: () => void;
  className?: string;
}

const variantClasses: Record<ToastVariant, string> = {
  success: "bg-success text-white",
  error: "bg-error text-white",
  info: "bg-primary text-white",
};

export default function Toast({
  variant,
  message,
  duration = 3000,
  onClose,
  className = "",
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Maneja el cierre con animación de salida de 200ms
  const handleClose = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 200);
  }, [isExiting, onClose]);

  // Animación de entrada: translate-y desde abajo + fade-in (200ms)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Temporizador automático con limpieza al desmontar
  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration, handleClose]);

  // Si no se sobreescribe la posición, se sitúa fija abajo a la derecha
  const hasCustomPosition =
    className.includes("static") ||
    className.includes("relative") ||
    className.includes("absolute") ||
    className.includes("fixed");

  const positionClass = hasCustomPosition ? "" : "fixed bottom-6 right-6 z-50";

  // Clases de animación según el estado
  const animationClasses = isExiting
    ? "opacity-0 transition-opacity duration-200 ease-in"
    : isVisible
    ? "opacity-100 translate-y-0 transition-all duration-200 ease-out"
    : "opacity-0 translate-y-2";

  const role = variant === "error" ? "alert" : "status";
  const ariaLive = variant === "error" ? "assertive" : "polite";

  return (
    <div
      aria-live={ariaLive}
      className={`flex max-w-[400px] w-full items-center gap-3 px-4 py-3 rounded-lg shadow-lg font-body ${variantClasses[variant]} ${animationClasses} ${positionClass} ${className}`.trim()}
      role={role}
    >
      {/* Ícono según variante */}
      <span className="flex shrink-0 items-center justify-center">
        {variant === "success" && (
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {variant === "error" && (
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        {variant === "info" && (
          <svg
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </span>

      {/* Mensaje */}
      <p className="flex-1 text-sm font-medium leading-snug break-words">
        {message}
      </p>

      {/* Botón cerrar (X) */}
      <button
        aria-label="Cerrar notificación"
        className="ml-auto inline-flex shrink-0 items-center justify-center rounded-md p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer"
        onClick={handleClose}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ========================================================
// Contexto y Hook useToast para uso global en la aplicación
// ========================================================

export interface ToastOptions {
  variant: ToastVariant;
  message: string;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => {
      // Máximo 3 toasts simultáneos apilados
      const updated = [...prev, { ...options, id }];
      return updated.slice(-3);
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Contenedor apilado en la esquina inferior derecha */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 items-end pointer-events-none"
        >
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <Toast
                className="static"
                duration={toast.duration}
                message={toast.message}
                onClose={() => hideToast(toast.id)}
                variant={toast.variant}
              />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe ser utilizado dentro de un <ToastProvider>.");
  }
  return context;
}

export { Toast };
