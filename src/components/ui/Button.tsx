"use client";

import type { ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "warning"
  | "naranja";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary:
    "border-[1.5px] border-secondary bg-transparent text-secondary hover:bg-secondary/10",
  ghost: "bg-transparent text-text-primary hover:bg-primary-soft",
  danger: "bg-error text-white hover:opacity-90",
  warning: "bg-warning text-black hover:opacity-90",
  naranja: "bg-secondary text-black hover:bg-secondary-hover",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  children,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const stateClasses = isDisabled
    ? "bg-surface text-text-disabled"
    : variantClasses[variant];

  return (
    <button
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium font-body transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed ${sizeClasses[size]} ${stateClasses} ${className}`}
      disabled={isDisabled}
      onClick={onClick}
      type={type}
    >
      {loading && (
        <svg
          aria-hidden="true"
          className="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 0 1 8-8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="4"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
