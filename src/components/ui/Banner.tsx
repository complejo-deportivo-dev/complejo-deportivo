"use client";

import type React from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

type BannerVariant = "success" | "error" | "warning" | "info";

interface BannerProps {
  variant: BannerVariant;
  children: React.ReactNode;
  onClose?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BannerVariant, string> = {
  success: "border-success bg-success-soft text-success",
  error: "border-error bg-error-soft text-error",
  warning: "border-warning bg-warning-soft text-warning-text",
  info: "border-primary bg-primary-soft text-primary",
};

const variantIcons: Record<BannerVariant, React.ReactNode> = {
  success: <CheckCircle aria-hidden="true" className="h-5 w-5 shrink-0" />,
  error: <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0" />,
  warning: <AlertTriangle aria-hidden="true" className="h-5 w-5 shrink-0" />,
  info: <Info aria-hidden="true" className="h-5 w-5 shrink-0" />,
};

export default function Banner({
  variant,
  children,
  onClose,
  icon,
  className = "",
}: BannerProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-md border-l-4 px-4 py-3 ${variantClasses[variant]} ${className}`}
      role="alert"
    >
      {icon ?? variantIcons[variant]}
      <div className="min-w-0 flex-1">{children}</div>
      {onClose && (
        <button
          aria-label="Cerrar"
          className="shrink-0 cursor-pointer transition-opacity hover:opacity-70"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
